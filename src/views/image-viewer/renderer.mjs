import { imgViewer } from '../components/img-viewer.mjs';
import { get, make, render } from '../lib/dom-utils.mjs'
import { exitFullscreen, toggleFullScreen } from '../lib/full-screen.mjs';
import { isImage } from '../lib/image-files.mjs';

async function getInfo (imgPath) {
	const [ imgInfo, imgStat ] = await Promise.all([
		api.imgInfo(imgPath),
		api.fileStat(imgPath),
	]);

	const statTxt = make.div({
		style: {
			textAlign: 'center',
		}
	},`
		${imgInfo.width} x ${imgInfo.height} pixels
		&nbsp;&nbsp;&nbsp;
		${imgStat.size}B
		&nbsp;&nbsp;&nbsp;
		Last&nbsp;modified: ${imgStat.dateModified}
	`);

	render(get('info'), statTxt);
}

async function displayImg (stat, wrap = false) {
	document.title = stat.name;
	const imgPath = `${stat.parentPath}/${stat.name}`;

	api.updateCurrentPath(imgPath);

	let imgStat = {
		image: imgPath,
	}; 

	const img = imgViewer({ stat: imgStat });
	getInfo(imgPath);
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

	api.infoListener(() => {
		let showInfo = JSON.parse(sessionStorage.getItem('showInfo') ?? 'false');
		showInfo = !showInfo;
		sessionStorage.setItem('showInfo',JSON.stringify(showInfo));
		get('info').style.display = showInfo ? 'block' : 'none';
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
					console.error(e.code);
			}
		}
	});
}

main();