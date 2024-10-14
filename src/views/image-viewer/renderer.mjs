import { imgViewer } from '../components/img-viewer.mjs';
import { get, make, render } from '../lib/dom-utils.mjs'
import { toggleFullScreen } from '../lib/full-screen.mjs';
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
	let currentImageStat;

	/** @type {import('../../services/config.mjs').Config} */
	const config = await api.getConfig();

	if (config.showInfo) {
		sessionStorage.setItem('showInfo', 'true');
	}

	api.infoListener(() => {
		let showInfo = JSON.parse(sessionStorage.getItem('showInfo') ?? 'false');
		showInfo = !showInfo;
		sessionStorage.setItem('showInfo',JSON.stringify(showInfo));
		get('info').style.display = showInfo ? 'block' : 'none';
	});

	api.fullScreenToggleListener(async () => {
		await toggleFullScreen();
	});

	api.resizeListener(async (divisor) => {
		const imgPath = `${currentImageStat.parentPath}/${currentImageStat.name}`;
		const {width, height} = await api.imgInfo(imgPath);

		return {
			width,
			height,
			divisor,
		}
	})

	api.imgListener((files, index) => {
		let idx = index;
		currentImageStat = files[idx];

		displayImg(currentImageStat);

		document.onfullscreenchange = () => {
			if (!document.fullscreenElement) {
				// Exit full screen
				displayImg(currentImageStat, true);
			}
		}

		window.onkeyup = (e) => {
			switch (e.code) {
				case 'ArrowRight': {
					let i = idx;
					while (i < files.length) {
						i++;
						if (isImage(files[i].name)) {
							idx = i;
							currentImageStat = files[idx];
							displayImg(currentImageStat, true);
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
							currentImageStat = files[idx];
							displayImg(currentImageStat, true);
							break;
						}
					}
					break;
				}
				default:
					console.log(e.code);
			}
		}
	});
}

main();