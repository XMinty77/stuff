import { Reader } from './reader.js';
/**
 * Reads a `File` instance
 */
export declare class BrowserFileReader extends Reader {
    protected _file: File;
    /**
     * @param {File} file File to read
     */
    constructor(file: File);
    /** @inheritdoc */
    open(): Promise<void>;
    /** @inheritdoc */
    read(length: number, position: number): Promise<ArrayBuffer>;
}
//# sourceMappingURL=browserFileReader.d.ts.map