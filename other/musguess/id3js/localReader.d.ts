import { Reader } from './reader.js';
/**
 * Provides read access to the local file system
 */
export declare class LocalReader extends Reader {
    protected _path: string;
    protected _fd?: number;
    /**
     * @param {string} path Path of the local file
     */
    constructor(path: string);
    /** @inheritdoc */
    open(): Promise<void>;
    /** @inheritdoc */
    close(): Promise<void>;
    /** @inheritdoc */
    read(length: number, position: number): Promise<ArrayBuffer>;
}
//# sourceMappingURL=localReader.d.ts.map