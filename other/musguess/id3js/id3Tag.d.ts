import { Reader } from './reader.js';
import { ID3Frame, ImageValue } from './id3Frame.js';
export interface ID3Tag {
    title: string | null;
    album: string | null;
    artist: string | null;
    year: string | null;
    [key: string]: unknown;
}
export interface ID3TagV1 extends ID3Tag {
    kind: 'v1';
    comment: string | null;
    track: string | null;
    genre: string | null;
    version: number;
}
export interface ID3TagV2 extends ID3Tag {
    kind: 'v2';
    version: [number, number];
    frames: ID3Frame[];
    images: ImageValue[];
}
/**
 * Parses a given resource into an ID3 tag
 * @param {Reader} handle Reader to use for reading the resource
 * @return {Promise<ID3Tag|null>}
 */
export declare function parse(handle: Reader): Promise<ID3Tag | null>;
//# sourceMappingURL=id3Tag.d.ts.map