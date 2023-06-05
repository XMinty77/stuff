/**
 * Provides read access to a given resource
 */
export declare abstract class Reader {
    /**
     * Size of the resource
     */
    size: number;
    /**
     * Opens the resource for reading
     * @return {Promise<void>}
     */
    abstract open(): Promise<void>;
    /**
     * Closes the resource
     * @return {Promise<void>}
     */
    close(): Promise<void>;
    /**
     * Reads a specified range of the resource
     * @param {number} length Number of bytes to read
     * @param {number} position Position to begin from
     * @return {Promise<ArrayBuffer>}
     */
    abstract read(length: number, position: number): Promise<ArrayBuffer>;
    /**
     * Reads a specified range into a Blob
     * @param {number} length Number of bytes to read
     * @param {number} position Position to begin from
     * @param {string=} type Type of data to return
     * @return {Promise<Blob>}
     */
    readBlob(length: number, position?: number, type?: string): Promise<Blob>;
}
//# sourceMappingURL=reader.d.ts.map