export function decodeBase64 (txt) {
	return Buffer.from(txt,'base64').toString();
}

export function encodeBase64 (txt) {
	return Buffer.from(txt).toString('base64')
}
