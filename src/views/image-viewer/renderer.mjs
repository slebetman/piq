import { imgViewer } from '../components/img-viewer.mjs';
import { render } from '../lib/dom-utils.mjs'
import { exitFullscreen, toggleFullScreen } from '../lib/full-screen.mjs';
import { isImage } from '../lib/image-files.mjs';

async function displayImg (stat, wrap = false) {
	document.title = stat.name;
	const imgPath = `${stat.parentPath}/${stat.name}`;

	api.updateCurrentPath(imgPath);

	const img = imgViewer({
		stat: {
			image: imgPath,
		}
	});
	render(document.body, img);

	if (wrap) {
		const imgInfo = await api.imgInfo(imgPath);
		api.wrapWindow(imgInfo.width, imgInfo.height);
	}
}

async function main () {
	api.fullScreenToggleListener(() => {
		toggleFullScreen();
	});

	api.imgListener((files, index) => {
		let idx = index;
		
		displayImg(files[idx]);

		window.onkeyup = (e) => {
			switch (e.code) {
				case 'ArrowRight': {
					let i = idx;
					while (i < files.length) {
						i++;
						if (isImage(files[i].name)) {
							idx = i;
							displayImg(files[idx], true);
							break;
						}
					}
					break;
				}
				case 'ArrowLeft': {
					let i = idx;
					while (i > 0) {
						i--;
						if (isImage(files[i].name)) {
							idx = i;
							displayImg(files[idx], true);
							break;
						}
					}
					break;
				}
				case 'Escape':
						exitFullscreen();
					break;
				default:
					console.log(e.code);
			}
		}
	});
}

main();