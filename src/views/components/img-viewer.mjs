import { make } from '../lib/dom-utils.mjs';
import { safePath } from '../lib/safe-path.mjs';

export function imgViewer ({ stat }) {
	const showInfo = JSON.parse(sessionStorage.getItem('showInfo') ?? 'false');

	return make.div({style:{
		width: '100vw',
		height: '100vh',
	}},[
		make.img({
			src: safePath(stat.image),
			className: 'viewer-image',
			onauxclick: (e) => {
				if (e.button === 2) {
					api.contextMenuImg(stat.image);
				}
			}
		}),
		make.div({
			id: 'info',
			style: {
				display: showInfo ? 'block' : 'none',
				position: 'fixed',
				left: 0,
				right: 0,
				bottom: 0,
				marginLeft: 'auto',
				marginRight: 'auto',
				padding: '4px 10px',
				width: 'fit-content',
				height: 'fit-content',
				background: '#000',
				color: '#fff',
				borderRadius: '12px 12px 0 0',
				fontSize: '10px',
				opacity: '0.75',
			}
		}),
	])
}