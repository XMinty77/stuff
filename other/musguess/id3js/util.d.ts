/**
 * Retrieves a string from a specific offset of a data view
 * @param {DataView} view View to retrieve string from
 * @param {number|null} length Bytes to read
 * @param {number=} offset Offset to read from
 * @param {boolean=} raw Whether to return the raw string or not
 * @return {string}
 */
export declare function getString(view: DataView, length: number | undefined, offset?: number, raw?: boolean): string;
/**
 * Retrieves a UTF16 string from a specific offset of a data view
 * @param {DataView} view View to retrieve string from
 * @param {number|null} length Bytes to read
 * @param {number=} offset Offset to read from
 * @param {boolean=} bom Whether to use BOM or not
 * @return {string}
 */
export declare function getStringUtf16(view: DataView, length: number | null, offset?: number, bom?: boolean): string;
/**
 * Gets the "synch" representation of a number
 * @param {number} num Number to convert
 * @return {number}
 */
export declare function getSynch(num: number): number;
/**
 * Gets a "synch2 uint8 from a view
 * @param {DataView} view View to read
 * @param {number=} offset Offset to read from
 * @return {number}
 */
export declare function getUint8Synch(view: DataView, offset?: number): number;
/**
 * Gets a "synch2 uint32 from a view
 * @param {DataView} view View to read
 * @param {number=} offset Offset to read from
 * @return {number}
 */
export declare function getUint32Synch(view: DataView, offset?: number): number;
/**
 * Gets a uint24 from a view
 * @param {DataView} view View to read
 * @param {number=} offset Offset to read from
 * @param {boolean=} littleEndian Whether to use little endian or not
 * @return {number}
 */
export declare function getUint24(view: DataView, offset?: number, littleEndian?: boolean): number;
//# sourceMappingURL=util.d.ts.map