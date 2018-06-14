/**
 * extract number from string, if there is no number then return 0
 * @param str
 * @returns {number}
 */
export function extraNumFromString(str) {
	const patter = /\d+/g
	return parseInt(str.match(patter)) || 0
}