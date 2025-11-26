import { fileList } from '../components/file-list.mjs';
import { imgCache } from '../components/lib/file-container.mjs';
import { render } from '../lib/dom-utils.mjs'
import { exitFullscreen, toggleFullScreen } from '../lib/full-screen.mjs';
import { flipX, flipY, rotateLeft, rotateRight } from '../lib/image-transforms.mjs';

async function main () {
	const config = await api.getConfig();

	api.fullScreenToggleListener(() => {
		toggleFullScreen();
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

	/**
	 * @param {Dirent[]} files 
	 * @param {string} col Collection name
	 */
	function handleViewCollection (files, col) {
		document.title = col;

		render(document.body, fileList({
			files,
			currentPath: col,
			onOpen: async (path, index) => {
				await api.viewImage(path, files, index);
			},
			thumbnailSize: config.defaultThumbnailSize,
		}));

		window.onkeyup = (e) => {
			switch (e.code) {
				case 'Escape':
					exitFullscreen();
					break;
				default:
					console.log(e.code);
			}
		}
	}

	api.collectionListener((files, col) => {
		handleViewCollection(files, col);
	});
}

main();