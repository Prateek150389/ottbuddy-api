import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      success: true,
      service: 'OTTBuddy API',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}