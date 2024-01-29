import { Module } from '@nestjs/common';
import { IntelligenceController } from './intelligence.controller';
import { IntelligenceService } from './intelligence.service';

@Module({
  controllers: [IntelligenceController],
  providers: [IntelligenceService]
})
export class IntelligenceModule {}
