import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('ping')
  @Public()
  @ApiOperation({ summary: 'Health check ping' })
  @ApiResponse({ status: 200, description: 'Returns pong true' })
  ping(): { pong: true } {
    return { pong: true };
  }
}

// uit cursus, en dat andere health ding verwijderd.
