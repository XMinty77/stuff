import { Reader } from './reader.js';
/**
 * Reads a remote URL
 */
export declare class RemoteReader extends Reader {
    protected _url: string;
    /**
     * @param {string} url URL to retrieve
     */
    constructor(url: string);
    /** @inheritdoc */
    open(): Promise<void>;
    /** @inheritdoc */
    read(length: number, position: number): Promise<ArrayBuffer>;
}
//# sourceMappingURL=remoteReader.d.ts.map