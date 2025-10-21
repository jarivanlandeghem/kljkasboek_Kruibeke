import { Module, OnModuleDestroy } from '@nestjs/common'; // 👈 1
import {
  type DatabaseProvider, // 👈 3
  DrizzleAsyncProvider,
  drizzleProvider,
  InjectDrizzle,
} from './drizzle.provider';

@Module({
  providers: [...drizzleProvider],
  exports: [DrizzleAsyncProvider],
})
// 👇 1
export class DrizzleModule implements OnModuleDestroy {
  constructor(@InjectDrizzle() private readonly db: DatabaseProvider) {} // 👈 3

  // 👇 2
  async onModuleDestroy() {
    await this.db.$client.end(); // 👈 4
  }
}
