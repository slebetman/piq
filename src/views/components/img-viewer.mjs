import { make } from "../lib/dom-utils.mjs";
import { safePath } from "../lib/safe-path.mjs";

export function imgViewer ({ stat }) {
	return make.img({
		src: safePath(stat.image),
		style: {
			width: '100vw',
			height: '100vh',
			objectFit: 'cover',
			objectPosition: 'bottom',
		},
		onauxclick: (e) => {
			if (e.button === 2) {
				api.contextMenuImg(stat.image);
			}
		}
	})
}