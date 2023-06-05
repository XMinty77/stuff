import { ID3Tag } from './id3Tag.js';
import { Reader } from './reader.js';
/**
 * Parses ID3 tags from a given reader
 * @param {Reader} reader Reader to use
 * @return {Promise<ID3Tag>}
 */
export declare function fromReader(reader: Reader): Promise<ID3Tag | null>;
/**
 * Parses ID3 tags from a local path
 * @param {string} path Path to file
 * @return {Promise<ID3Tag>}
 */
export declare function fromPath(path: string): Promise<ID3Tag | null>;
/**
 * Parses ID3 tags from a specified URL
 * @param {string} url URL to retrieve data from
 * @return {Promise<ID3Tag>}
 */
export declare function fromUrl(url: string): Promise<ID3Tag | null>;
/**
 * Parses ID3 tags from a File instance
 * @param {File} file File to parse
 * @return {Promise<ID3Tag>}
 */
export declare function fromFile(file: File): Promise<ID3Tag | null>;
//# sourceMappingURL=id3.d.ts.map