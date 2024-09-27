import { imgViewer } from '../components/img-viewer.mjs';
import { make, render } from '../lib/dom-utils.mjs'
import { safePath } from '../lib/safe-path.mjs';

async function main () {
	api.imgListener((stat) => {
		// image: imgPath,
		// width: stat.width,
		// height: stat.height,
		// type: stat.format,
		// size: readable(stat.size),

		const img = imgViewer({imgPath: stat.image});

		document.title = `Piq: ${stat.name}`;

		render(document.body, img);
	})
}

main();