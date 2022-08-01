import {CookieOptions, Router, Response, Request} from "express";
import {ArraySome, HttpMethod, OneOrMore, Primitive, RecLike} from "@leyyo/core";

export type RequestBody = ArraySome|RecLike|string|unknown;
export type ResponseData = ArraySome|RecLike|string|unknown;
export interface MockServiceRequest {
    method: HttpMethod;
    url: string;
    body?: RequestBody;
    headers?: RecLike<OneOrMore<string>>;
    cookies?: RecLike;
    signedCookies?: RecLike;
}
export interface MockServiceProcessedResponse {
    status: number;
    statusMessage: string;
    headers: RecLike<OneOrMore<string>>;
    data: ResponseData;
}
export interface MockServicePreparedResponse {
    status: number;
    statusMessage: string;
    headers: RecLike<OneOrMore<string>>;
    cookies: RecLike<ResponseCookie>;
    clearedCookies: RecLike<CookieOptions>;
    data: ResponseData;
    locals: RecLike;
}

export interface MockRouterLike extends Router {
    isFake: boolean;
    handle(req: MockRequestLike, res: MockResponseLike): void;
}

export interface MockRequestLike<B = RequestBody, L = RecLike> extends Request<RecLike, B, ResponseData, RecLike, L> {
    isFake?: boolean;
    locals?: L;
}
export interface MockResponseLike<D = ResponseData, L = RecLike> extends Response<D, L> {
    isFake: boolean;
}

export type MockResponseResolve = (dto: MockServicePreparedResponse) => void;
export type MockResponseReject = (e: Error) => void;
export type MockResponseLocalMerger<T = RecLike> = (content: T, origin: T) => void;

// region express
export interface ResponseCookie {
    value: Primitive;
    opt: CookieOptions;
}