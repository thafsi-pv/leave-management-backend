import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from './config.service';

@Controller('config')
@UseGuards(AuthGuard('jwt'))
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('shift')
  getShiftConfig() {
    return this.configService.getShiftConfig();
  }

  @Post('shift')
  setShiftConfig(@Body() config: any, @Request() req) {
    return this.configService.setShiftConfig(config, req.user);
  }
}
