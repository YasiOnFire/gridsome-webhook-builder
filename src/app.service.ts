import { Injectable, Logger, Inject, LoggerService } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
@Injectable()
export class AppService {
  private isBuilding: boolean = false;

  constructor(@Inject(Logger) private readonly logger: LoggerService) { }

  healthCheck(): object {
    return { status: 'ok', time: new Date()};
  }

  async startBuild(): Promise<object> {
    if (this.isBuilding) {
      return {
        message: 'already building',
        status: 'error',
      };
    }
    const targetPath = path.resolve(__dirname, '../../ju-front');
    try {
      process.chdir(targetPath);
      // Enter your command here
      const child = spawn('npm', ['run', 'build'], { shell: true });
      this.isBuilding = true;
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const response = data.toString();
        if (response.indexOf('Done') > -1) { this.isBuilding = false; }
        this.logger.log(response);
      });
    } catch (err) {
      this.logger.error(err);
      return {
        message: err,
        status: 'error',
      };
    }

    this.logger.log('building website');
    return { status: 'building triggered', time: new Date()};
  }
}
