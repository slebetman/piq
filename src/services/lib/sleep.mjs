export function sleep (ms) {
	return new Promise((ok) => setTimeout(ok, ms));
}