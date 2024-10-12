export function toggleFullScreen() {
	if (!document.fullscreenElement) {
		return document.documentElement.requestFullscreen();
	} else {
		return document.exitFullscreen?.();
	}
}

export function exitFullscreen() {
	if (document.fullscreenElement) {
		return document.exitFullscreen?.();
	}
}