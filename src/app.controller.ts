import { Controller, Get, Body, Post, HttpCode, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  healthCheck(): object {
    return this.appService.healthCheck();
  }

  @Post()
  @HttpCode(200)
  @Header('Cache-Control', 'none')
  webhook(): object {
    return this.appService.startBuild();
  }
}
