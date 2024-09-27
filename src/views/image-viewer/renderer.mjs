import { imgViewer } from '../components/img-viewer.mjs';
import { render } from '../lib/dom-utils.mjs'

async function main () {
	api.imgListener((stat) => {
		// stat: {
		//   image: imgPath,
		//   width,
		//   height,
		//   type: stat.format,
		//   size: readable(stat.size),
		// }

		const img = imgViewer({imgPath: stat.image});

		document.title = `Piq: ${stat.name}`;

		render(document.body, img);
	})
}

main();