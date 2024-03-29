import { Http2ServerRequest, Http2ServerResponse } from "http2";

import {
  BaseExceptionHandlerInterface,
  BaseExceptionInterface,
  ExceptionDump,
} from "./interfaces/exception";
import {
  BaseHttpResponseInterface,
  HTTP_STATUS,
  HttpResponseDataInterface,
} from "./interfaces/http";
import { JSONLikeInterface } from "./interfaces/object";
import { HttpClient } from "./http_client";

export abstract class Exception {
  protected _exception: BaseExceptionInterface = {
    exceptionMessage: "",
    exceptionData: undefined,
  };

  constructor(
    exception: string | JSONLikeInterface | BaseExceptionInterface,
    protected _assign?: any,
  ) {
    if (
      typeof exception === "object" &&
      !exception.hasOwnProperty("exceptionMessage")
    )
      exception = JSON.stringify(exception);

    this.exception =
      typeof exception === "string"
        ? { exceptionMessage: exception, exceptionData: undefined }
        : (exception as BaseExceptionInterface);
  }

  get exception(): BaseExceptionInterface {
    return this._exception;
  }

  set exception(exception: BaseExceptionInterface) {
    Object.assign(this._exception, this._onSetException(exception));
  }

  protected abstract _onSetException(
    exception: BaseExceptionInterface,
  ): BaseExceptionInterface;
}

export class HttpException extends Exception {
  constructor(
    exception: string | JSONLikeInterface | BaseHttpResponseInterface,
    assign?: { status?: number; contentType?: string },
  ) {
    super(exception, assign);
  }

  protected _onSetException(exception: BaseHttpResponseInterface) {
    exception.responseData ||= {};

    this._assign?.status &&
      (exception.responseData.status = this._assign.status);

    this._assign?.contentType &&
      (exception.responseData.contentType = this._assign.contentType);

    exception.responseData.status ||= HTTP_STATUS.INTERNAL_SERVER_ERROR;

    return exception;
  }
}

export class RuntimeException extends Exception {
  protected _onSetException(exception) {
    return exception;
  }
}

export abstract class ExceptionHandler
  implements BaseExceptionHandlerInterface
{
  protected constructor(protected _exception: Exception) {}

  get exceptionData(): BaseExceptionInterface {
    return this._exception.exception;
  }

  get exception(): Exception {
    return this._exception;
  }

  abstract resolve(): PromiseLike<any>;
}

export class HttpExceptionHandler extends ExceptionHandler {
  constructor(exception: HttpException) {
    super(exception);
  }

  async resolve() {}
}

export class RuntimeExceptionHandler extends ExceptionHandler {
  constructor(exception: RuntimeException) {
    super(exception);
  }

  async resolve() {}
}

export class ExceptionLog {
  private _dumpData: ExceptionDump = {
    query: "",
    error: undefined,
  };

  http: BaseHttpResponseInterface;

  constructor(readonly source: any) {}

  get exception(): BaseExceptionInterface {
    const isException =
      this.source instanceof Exception ||
      this.source instanceof ExceptionHandler;
    const exception = isException
      ? this.source.exceptionData ?? this.source.exception
      : ({} as BaseExceptionInterface);
    const exceptionMessage =
      typeof this.source === "string"
        ? this.source
        : typeof this.source === "object"
        ? exception.exceptionMessage ?? ""
        : "";
    const exceptionData = isException ? exception.exceptionData : this.source;

    return { ...exception, ...{ exceptionMessage, exceptionData } };
  }

  get dump(): string {
    if (!this.dumpData.query && !this.dumpData.error) return "";

    const error = this.dumpData.error
      ? require("node:util").format(this.dumpData.error)
      : "";

    return `${this.dumpData.query}\n${error}`;
  }

  get dumpData() {
    return this._dumpData;
  }

  onHttp(request: Http2ServerRequest, response: Http2ServerResponse) {
    const responseData = this.getHttpResponseData(request, response);

    this.dumpData.httpStatusCode = responseData.status;

    this.dumpData.query =
      "HTTP " +
      this.http.request.method.toUpperCase() +
      ": " +
      responseData.status +
      ": " +
      this.http.request.url +
      ": " +
      responseData.content;

    this.dumpData.error =
      this.http.exceptionMessage === this.http.exceptionData?.toString()
        ? this.http.exceptionMessage
        : this.http.exceptionData;

    return responseData;
  }

  getHttpResponseData(
    request: Http2ServerRequest,
    response: Http2ServerResponse,
  ): HttpResponseDataInterface {
    const exception = this._getHttpException(request, response);

    if (
      this.source instanceof HttpExceptionHandler ||
      this.source instanceof HttpException
    ) {
      const data = HttpClient.getHttpResponseData(exception);
      const content = HttpClient.getHttpResponseDataContent(data);

      return {
        status: data.status,
        contentType: data.contentType,
        content:
          content ||
          exception.exceptionMessage ||
          HttpClient.getStatusCodeMessage(data.status),
      };
    }

    return HttpClient.getDataFromStatusCode(exception);
  }

  protected _getHttpException(
    request: Http2ServerRequest,
    response: Http2ServerResponse,
  ): BaseHttpResponseInterface {
    const exception = this.exception as BaseHttpResponseInterface;

    exception.request ||= request;
    exception.response ||= response;

    this.http =
      this.source instanceof HttpExceptionHandler ||
      this.source instanceof HttpException
        ? exception
        : ({ request, response } as BaseHttpResponseInterface);

    this.http.exceptionMessage = exception.exceptionMessage;

    this.http.exceptionData =
      exception.exceptionData || exception.exceptionMessage;
    this.http.responseData ||= {};

    if (
      !this.http.responseData.status ||
      this.http.responseData.status === HTTP_STATUS.OK
    ) {
      this.http.responseData.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    }

    return this.http;
  }
}
