import { HttpException } from '@nestjs/common';
import { HttpExceptionFilter } from '../src/lib/http-exceptions.filter';
import { Logger } from '@nestjs/common';
import { LoggerMiddleware } from '../src/lib/logger.middleware';

describe('HttpExceptionFilter', () => {
  it('uses exception message when response is string', () => {
    const filter = new HttpExceptionFilter();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response: any = { status };

    const host: any = {
      switchToHttp: () => ({ getResponse: () => response }),
      getHandler: () => ({}),
    };

    const ex = new HttpException('oops', 400);
    filter.catch(ex, host as any);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalled();
  });

  it('copies message and details when provided as object', () => {
    const filter = new HttpExceptionFilter();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response: any = { status };

    const host: any = { switchToHttp: () => ({ getResponse: () => response }) };

    const exObj: any = new HttpException({ message: 'custom', details: { a: 1 } }, 422);
    filter.catch(exObj, host as any);

    expect(status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: 'custom', details: { a: 1 } }));
  });
});

describe('LoggerMiddleware', () => {
  let originalLog: any;
  let originalWarn: any;
  let originalError: any;

  beforeAll(() => {
    originalLog = Logger.prototype.log;
    originalWarn = Logger.prototype.warn;
    originalError = Logger.prototype.error;
  });

  afterAll(() => {
    Logger.prototype.log = originalLog;
    Logger.prototype.warn = originalWarn;
    Logger.prototype.error = originalError;
  });

  it('calls error for >=500, warn for >=400, log otherwise', () => {
    const calls: string[] = [];
    Logger.prototype.log = () => calls.push('log');
    Logger.prototype.warn = () => calls.push('warn');
    Logger.prototype.error = () => calls.push('error');

    const mw = new LoggerMiddleware();

    const next = jest.fn();

    // simulate res.on behaviour
    function makeRes(code: number) {
      let cb: Function | null = null;
      return {
        statusCode: code,
        on: (_: string, fn: Function) => {
          cb = fn;
        },
        _run: () => cb && cb(),
      } as any;
    }

    const req: any = { method: 'GET', originalUrl: '/x' };

    const r1 = makeRes(200);
    mw.use(req, r1, next);
    r1._run();

    const r2 = makeRes(404);
    mw.use(req, r2, next);
    r2._run();

    const r3 = makeRes(500);
    mw.use(req, r3, next);
    r3._run();

    expect(calls).toEqual(expect.arrayContaining(['log','warn','error']));
  });
});
