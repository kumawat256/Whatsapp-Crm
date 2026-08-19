import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class ConfiguredSocketIoAdapter extends IoAdapter {
  constructor(private readonly app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const config = this.app.get(ConfigService);
    return super.createIOServer(port, {
      ...options,
      cors: {
        origin: config.get<string>('CORS_ORIGIN'),
        credentials: true,
      },
    });
  }
}
