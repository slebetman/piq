import { make } from "../lib/dom-utils.mjs";
import { safePath } from "../lib/safe-path.mjs";

export function imgViewer ({ imgPath }) {
	return make.img({
		src: safePath(imgPath),
		style: {
			width: '100vw',
			height: '100vh',
			objectFit: 'contain',
		},
		onauxclick: (e) => {
			if (e.button === 2) {
				api.contextMenu(imgPath);
			}
		}
	})
}