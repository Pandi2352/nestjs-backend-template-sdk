import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs-extra';

export { HttpStatus };

export class ErrorEntity extends HttpException {
    constructor(response: any) {
        if (response && response.http_code) {
            super(response, response.http_code);
        } else {
            super(response, response?.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

export class LoggerHelper {
    private static _instance = new LoggerHelper();
    private logger = new Logger('Application');

    static get Instance() { return this._instance; }

    info(requestId: string, message: string, data?: any) {
        this.logger.log(`[${requestId}] ${message} ${data ? JSON.stringify(data) : ''}`);
    }
    error(requestId: string, message: string, error?: any) {
        this.logger.error(`[${requestId}] ${message}`, error instanceof Error ? error.stack : JSON.stringify(error));
    }
}

export class RandomNumberGenerator {
    static getUniqueId() {
        return uuidv4();
    }
}

export interface RequestContext {
    x_request_id: string;
    tenant_key: string;
    base_url: string;
    tenant_config?: any;
    [key: string]: any;
}

export class ConfigPathResolver {
    private static _instance = new ConfigPathResolver();
    static get Instance() { return this._instance; }
    resolveResourcePath(path: string) { return path; }
}

export class ConfigResolver {
    private static _instance = new ConfigResolver();
    static get Instance() { return this._instance; }
    readAsJSON(path: string) {
        try {
            return fs.readJSONSync(path);
        } catch (e) {
            return {};
        }
    }
}
