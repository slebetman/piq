export function toggleFullScreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
	} else {
		document.exitFullscreen?.();
	}
}

export function exitFullscreen() {
	if (document.fullscreenElement) {
		document.exitFullscreen?.();
	}
}