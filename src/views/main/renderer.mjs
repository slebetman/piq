import { emptyPage } from '../components/empty-page.mjs';
import { fileList } from '../components/file-list.mjs';
import { imgCache } from '../components/lib/file-container.mjs';
import { getData, render, setData } from '../lib/dom-utils.mjs'
import { exitFullscreen, toggleFullScreen } from '../lib/full-screen.mjs';

const scrollPosition = JSON.parse(sessionStorage.getItem('scroll') ?? '{}');


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

function rotateRight (imgPath) {
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

function rotateLeft (imgPath) {
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

function flipX (imgPath) {
	/** @type {HTMLElement} */
	const img = getImgDiv(imgPath);

	if (img) {
		let flip = getData(img, 'flipX', { default: false });
		setData(img, 'flipX', !flip);

		applyTransforms(img);
	}
}

function flipY (imgPath) {
	/** @type {HTMLElement} */
	const img = getImgDiv(imgPath);

	if (img) {
		let flip = getData(img, 'flipY', { default: false });
		setData(img, 'flipY', !flip);

		applyTransforms(img);
	}
}

async function main () {
	const config = await api.getConfig();

	api.fullScreenToggleListener(() => {
		toggleFullScreen();
	});

	api.dirListener(async (dirPath) => {
		const files = await api.listDir(dirPath);
		handleOpenDir({files, path: dirPath});
	});

	api.thumbnailListener(async (imgPath) => {
		const img = imgCache[imgPath].getElementsByTagName('img')[0];

		if (img) {
			img.src = await api.thumbnailBuffer(imgPath, true);
		}
	});

	api.thumbnailTransformListener((imgPath, transform) => {
		switch (transform) {
			case 'flipX':
				flipX(imgPath);
				break;
			case 'flipY':
				flipY(imgPath);
				break;
			case 'rotateLeft':
				rotateLeft(imgPath);
				break;
			case 'rotateRight':
				rotateRight(imgPath);
				break;
		}
	});

	async function chdir (path) {
		const oldPath = sessionStorage.getItem('currentPath');
		scrollPosition[oldPath] = document.documentElement.scrollTop;
		sessionStorage.setItem('scroll', JSON.stringify(scrollPosition));
	
		const normalPath = await api.normalizePath(path);
		const newFiles = await api.listDir(path);
		handleOpenDir({ files: newFiles, path: normalPath });
	}

	function handleOpenDir ({files, path: currentPath}) {
		const oldPath = sessionStorage.getItem('currentPath');
		sessionStorage.setItem('currentPath', currentPath);
		document.title = currentPath.split('/').pop();
		api.updateCurrentPath(currentPath);

		render(document.body, fileList({
			files,
			currentPath,
			onChdir: chdir,
			onOpen: async (path, index) => {
				await api.viewImage(path, files, index);
			},
			thumbnailSize: config.defaultThumbnailSize,
		}));

		if (scrollPosition[currentPath]) {
			document.documentElement.scrollTop = scrollPosition[currentPath];
		}
		else {
			document.documentElement.scrollTop = 0;
		}

		let debounce;

		if (oldPath) {
			api.unwatch(oldPath);
		}

		api.watch(currentPath).then(async (x) => {
			if (x) {
				scrollPosition[currentPath] = document.documentElement.scrollTop;
				sessionStorage.setItem('scroll', JSON.stringify(scrollPosition));
				clearTimeout(debounce);
				debounce = setTimeout(async () => {
					const sessionPath = sessionStorage.getItem('currentPath');
					if (sessionPath === currentPath) {
						const normalPath = await api.normalizePath(currentPath);
						const newFiles = await api.listDir(currentPath);
						handleOpenDir({ files: newFiles, path: normalPath });
					}
				}, 500);
			}
		});

		window.onkeyup = (e) => {
			switch (e.code) {
				case 'Escape':
					exitFullscreen();
					break;
				case 'Backspace':
					chdir(`${currentPath}/..`);
					break;
				default:
					console.log(e.code);
			}
		}
	}

	const lastPath = sessionStorage.getItem('currentPath');

	if (lastPath) {
		const files = await api.listDir(lastPath);
		handleOpenDir({files, path: lastPath});
	}
	else {
		const page = emptyPage({
			onOpen: async (result) => {
				await api.addHistory(result.path);
				await api.updateCurrentPath(result.path);
				handleOpenDir(result);
			}
		});

		render(document.body, page);
	}

	window.onbeforeunload = () => {
		scrollPosition[sessionStorage.getItem('currentPath')] = document.documentElement.scrollTop;
		sessionStorage.setItem('scroll', JSON.stringify(scrollPosition));
	}
}

main();