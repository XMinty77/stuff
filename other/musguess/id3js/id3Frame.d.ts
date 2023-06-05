export interface ID3Frame {
    tag: string | null;
    value: unknown | null;
    id: string | null;
}
export interface ImageValue {
    type: null | string;
    mime: null | string;
    description: null | string;
    data: null | ArrayBuffer;
}
export declare const types: ReadonlyMap<string, string>;
export declare const imageTypes: string[];
/**
 * Parses legacy frames for ID3 v2.2 and earlier
 * @param {ArrayBuffer} buffer Buffer to read
 * @return {ID3Frame|null}
 */
export declare function parseLegacy(buffer: ArrayBuffer): ID3Frame | null;
/**
 * Parses a given buffer into an ID3 frame
 * @param {ArrayBuffer} buffer Buffer to read data from
 * @param {number} major Major version of ID3
 * @param {number} minor Minor version of ID3
 * @return {ID3Frame|null}
 */
export declare function parse(buffer: ArrayBuffer, major: number, minor: number): ID3Frame | null;
//# sourceMappingURL=id3Frame.d.ts.map