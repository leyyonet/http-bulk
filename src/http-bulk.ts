import {Router, Request, Response} from "express";
import {RecLike, leyyo} from "@leyyo/core";
import {
    MockResponseLocalMerger,
    MockResponseReject,
    MockResponseResolve, MockRouterLike,
    MockServicePreparedResponse, MockServiceProcessedResponse,
    MockServiceRequest
} from "./internal-types";
import {httpMock} from "@leyyo/http-mock";

// noinspection JSUnusedGlobalSymbols
class HttpBulk {

    private async _runOne(service: MockServiceRequest, router: Router, req: Request, res: Response, custom?: RecLike): Promise<MockServicePreparedResponse> {
        return new Promise((resolve: MockResponseResolve, reject: MockResponseReject) => {
            const fakeRequest = httpMock.request(service, req, custom);
            const fakeResponse = httpMock.response(resolve, res);
            try {
                (router as unknown as MockRouterLike).handle(fakeRequest, fakeResponse);
            } catch (e) {
                reject(e);
            }
        });
    }

    async run(serviceMap: RecLike<MockServiceRequest>, router: Router, req: Request, res: Response, custom?: RecLike, localMerger?: MockResponseLocalMerger): Promise<RecLike<MockServiceProcessedResponse>> {
        if (!leyyo.is.object(serviceMap, true)) {
            return {};
        }
        if (typeof localMerger !== 'function') {
            localMerger = (content, origin) => {
                if (!leyyo.is.object(content)) {
                    return origin;
                }
                if (leyyo.is.object(origin)) {
                    return content;
                }
                for (const [k, v] of Object.entries(content)) {
                    origin[k] = v;
                }
                return origin;
            }
        }
        const names = Object.keys(serviceMap);
        const promises: Array<Promise<MockServicePreparedResponse>> = [];
        for (const [, service] of Object.entries(serviceMap)) {
            promises.push(this._runOne(service, router, req, res, custom));
        }
        const result: RecLike<MockServiceProcessedResponse> = {};
        const contents = await Promise.all(promises);
        contents.forEach((content, index) => {
            if (leyyo.is.object(content.clearedCookies)) {
                for (const [key, options] of Object.entries(content.clearedCookies)) {
                    res.clearCookie(key, options);
                }
            }
            if (leyyo.is.object(content.cookies)) {
                for (const [key, value] of Object.entries(content.cookies)) {
                    res.cookie(key, value);
                }
            }
            if (leyyo.is.object(content.locals) && Object.keys(content.locals).length > 0) {
                if (!leyyo.is.object(res.locals)) {
                    res.locals = {};
                }
                try {
                    localMerger(content.locals, res.locals);
                } catch (e) {

                }
            }
            result[names[index]] = {
                status: content.status,
                statusMessage: content.statusMessage,
                headers: content.headers,
                data: content.data,
            };
        });
        return result;
    }
}
export const httpBulk = new HttpBulk();