import {Exception} from "@leyyo/core";

export class TextCaseException extends Exception {
    /**
     * @param {string} fn
     * @param {unknown} value
     * */
    constructor(fn: string, value: unknown) {
        super(`TextCase.${fn}: text should be string but type is ${typeof value}`, {fn, value});
    }
}
