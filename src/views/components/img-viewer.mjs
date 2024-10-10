import { make } from '../lib/dom-utils.mjs';
import { safePath } from '../lib/safe-path.mjs';

export function imgViewer ({ stat }) {
	return make.img({
		src: safePath(stat.image),
		className: 'viewer-image',
		onauxclick: (e) => {
			if (e.button === 2) {
				api.contextMenuImg(stat.image);
			}
		}
	})
}