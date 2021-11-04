import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
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
    const targetPath = path.resolve(__dirname, process.env.TARGET_DIR);
    const destPath = path.resolve(__dirname, process.env.DESTINATION);
    const cdnPath = path.resolve(__dirname, '../cdn');
    try {
      process.chdir(targetPath);

      if (!fs.existsSync(path.resolve(targetPath, 'package.json'))) {
        return {
          message: 'package.json does not exist',
          status: 'error',
        };
      }

      fs.copyFileSync(`${cdnPath}/building.png`, `${cdnPath}/status.png`);

      // Enter your command here
      const child = spawn('npm', ['run', 'build'], { shell: true });
      this.isBuilding = true;
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (data) => {
        const response = data.toString();
        if (response.indexOf('Done') > -1 || response.indexOf('Error') > -1) {
          this.isBuilding = false;
          this.copyDir(path.resolve(targetPath, './dist'), destPath);
          fs.copyFileSync(`${cdnPath}/deployed.png`, `${cdnPath}/status.png`);
        }
        if (response.toLowerCase().indexOf('error') > -1) {
          fs.copyFileSync(`${cdnPath}/error.png`, `${cdnPath}/status.png`);
          this.logger.error(response);
        }
        this.logger.log(response);
      });
    } catch (err) {
      fs.copyFileSync(`${cdnPath}/error.png`, `${cdnPath}/status.png`);
      this.logger.error(err);
      return {
        message: err,
        status: 'error',
      };
    }

    this.logger.log('building website');
    return { status: 'building triggered', time: new Date()};
  }
  copyDir(targetPath: string, destPath: string) {
    const files = fs.readdirSync(targetPath);
    files.forEach((file) => {
      const targetFile = path.join(targetPath, file);
      const destFile = path.join(destPath, file);
      if (fs.lstatSync(targetFile).isDirectory()) {
        if (!fs.existsSync(destFile)) {
          fs.mkdirSync(destFile);
        }
        this.copyDir(targetFile, destFile);
      } else {
        fs.copyFileSync(targetFile, destFile);
      }
    });
  }
}
