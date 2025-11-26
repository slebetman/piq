import { getData, setData } from "./dom-utils.mjs";

/**
 * @param {HTMLElement} img 
 */
function applyTransforms (img) {
	const angle = getData(img, 'rotate', { default: 0 });
	const scaleX = getData(img, 'flipX', { default: false }) ? -1 : 1;
	const scaleY = getData(img, 'flipY', { default: false }) ? -1 : 1;
	img.style.transform = `rotate(${angle}deg) scaleX(${scaleX}) scaleY(${scaleY})`
}

function getImgDiv (imgPath) {
	return document.querySelector(`div[data-path="${imgPath}"]`);
}

export function rotateRight (imgPath) {
	/** @type {HTMLElement} */
	const img = getImgDiv(imgPath);

	if (img) {
		let angle = getData(img, 'rotate', { default: 0 }) + 90;
		if (angle >= 360) {
			angle = 0;
		}
		setData(img, 'rotate', angle);

		applyTransforms(img);
	}
}

export function rotateLeft (imgPath) {
	/** @type {HTMLElement} */
	const img = getImgDiv(imgPath);

	if (img) {
		let angle = getData(img, 'rotate', { default: 0 }) - 90;
		if (angle < 0) {
			angle = 270;
		}
		setData(img, 'rotate', angle);

		applyTransforms(img);
	}
}

export function flipX (imgPath) {
	/** @type {HTMLElement} */
	const img = getImgDiv(imgPath);

	if (img) {
		let flip = getData(img, 'flipX', { default: false });
		setData(img, 'flipX', !flip);

		applyTransforms(img);
	}
}

export function flipY (imgPath) {
	/** @type {HTMLElement} */
	const img = getImgDiv(imgPath);

	if (img) {
		let flip = getData(img, 'flipY', { default: false });
		setData(img, 'flipY', !flip);

		applyTransforms(img);
	}
}