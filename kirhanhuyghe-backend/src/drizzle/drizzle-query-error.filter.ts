// src/drizzle/drizzle-query-error.filter.ts
import type { ExceptionFilter } from '@nestjs/common';
import { Catch, ConflictException, NotFoundException } from '@nestjs/common';
import { DrizzleQueryError } from 'drizzle-orm';

@Catch(DrizzleQueryError)
export class DrizzleQueryErrorFilter implements ExceptionFilter {
  catch(error: DrizzleQueryError) {
    // 👇 1
    if (!error.cause || !('code' in error.cause)) {
      throw new Error(error.message || 'Unknown database error');
    }

    // 👇 2
    const {
      cause: { code, message },
    } = error;

    // 👇 3
    switch (code) {
      case 'ER_DUP_ENTRY':
        if (message.includes('idx_place_name_unique')) {
          throw new ConflictException(
            'Een transactie met deze naam bestaat al',
          );
        } else if (message.includes('idx_user_email_unique')) {
          throw new ConflictException('Er is al een user met dit emailadres.');
        } else {
          throw new ConflictException('Deze transactie bestaat al');
        }
      case 'ER_NO_REFERENCED_ROW_2':
        if (message.includes('transactions_user_id')) {
          // TODO
          throw new NotFoundException('Er bestaan geen users met dit ID');
        } else if (message.includes('transactions_place_id')) {
          // TODO
          throw new NotFoundException('Er bestaat geen transactie met dit ID');
        }
        break;
    }

    throw error;
  }
}
