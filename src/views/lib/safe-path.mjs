export function safePath (txt) {
	return txt.split('/')
		.map(x => encodeURIComponent(x))
		.join('/');
}