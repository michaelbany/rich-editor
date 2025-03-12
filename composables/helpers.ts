/**
 * Ignore zero-width spaces in text length
 * @param str Node text
 * @returns Node text length without zero-width spaces
 */
export function realTextLengthWithoutZWS(str: string): number {
  return str.replace(/\u200B/g, "").length;
}

/**
 * Ignore zero-width spaces in offset
 * @param str Node text
 * @param offset Offset in the node text
 * @returns real offset without zero-width spaces
 */
export function realTextOffsetWithoutZWS(str: string, offset: number): number {
    const leadingZWS = (str.substring(0, offset).match(/\u200B/g) || []).length;
    return offset - leadingZWS;
}
