import type { ExceptionFilter } from '@nestjs/common';
import {
  Catch,
  ConflictException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleQueryError } from 'drizzle-orm';

@Catch(DrizzleQueryError)
export class DrizzleQueryErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(DrizzleQueryErrorFilter.name);

  catch(error: DrizzleQueryError) {
    this.logger.error({
      message: 'Database Query Error',
      error: error.message,
      code: (error.cause as any)?.code,
      stack: error.stack,
    });

    const cause = error.cause as any;

    if (!cause || typeof cause !== 'object' || !('code' in cause)) {
      throw new InternalServerErrorException(
        'Er is een interne fout opgetreden',
      );
    }

    const { code, message } = cause;

    switch (code) {
      case 'ER_DUP_ENTRY':
        if (message.includes('idx_place_name_unique')) {
          throw new ConflictException(
            'Een transactie met deze naam bestaat al',
          );
        } else if (message.includes('idx_user_email_unique')) {
          throw new ConflictException('Er is al een user met dit emailadres.');
        } else {
          throw new ConflictException('Dit record bestaat al');
        }
      case 'ER_NO_REFERENCED_ROW_2':
        if (message.includes('transactions_user_id')) {
          throw new NotFoundException('Er bestaan geen users met dit ID');
        } else if (message.includes('transactions_place_id')) {
          throw new NotFoundException('Er bestaat geen transactie met dit ID');
        }
        throw new NotFoundException('Gerelateerd record niet gevonden');
    }

    throw new InternalServerErrorException('Er is een interne fout opgetreden');
  }
}
