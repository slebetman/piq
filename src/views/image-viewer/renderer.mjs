import { imgViewer } from '../components/img-viewer.mjs';
import { render } from '../lib/dom-utils.mjs'
import { isImage } from '../lib/image-files.mjs';

function displayImg (stat) {
	const img = imgViewer({
		stat: {
			image: `${stat.parentPath}/${stat.name}`,
		}
	});
	render(document.body, img);
}

async function main () {
	api.imgListener((stat, files, index) => {
		let idx = index;
		
		// stat: {
		//   image: imgPath,
		//   width,
		//   height,
		//   type: stat.format,
		//   size: readable(stat.size),
		// }

		document.title = `Piq: ${stat.name}`;
		displayImg(files[idx]);

		document.body.onkeyup = (e) => {
			switch (e.code) {
				case 'ArrowRight': {
					let i = idx;
					while (i < files.length) {
						i++;
						if (isImage(files[i].name)) {
							idx = i;
							displayImg(files[idx]);
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
							displayImg(files[idx]);
							break;
						}
					}
					break;
				}
				case 'Escape':
					break;
				case 'KeyF':
					if (e.ctrlKey || e.metaKey) {
						console.log('FULLSCREEN');
					}
					break;
				default:
					console.log(e.code);
			}
		}
	})
}

main();