import { make, render } from '../lib/dom-utils.mjs'

async function main () {
	api.imgListener((stat) => {
		// image: imgPath,
		// width: stat.width,
		// height: stat.height,
		// type: stat.format,
		// size: readable(stat.size),

		const img = make.img({
			src: stat.image,
			style: {
				width: '100vw',
				height: '100vh',
				objectFit: 'contain',
			}
		});

		document.title = `Piq: ${stat.name}`;

		render(document.body, img);
	})
}

main();