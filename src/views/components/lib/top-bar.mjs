import { cssVar, make } from '../../lib/dom-utils.mjs';
import { slider } from './slider.mjs';

export const BAR_HEIGHT = '24px';
let size = 150;

cssVar('--thumbnail-size', `${size}px`);
cssVar('--bar-height', BAR_HEIGHT);

/**
 * @typedef {Object} TopBarProps
 * @property {string} currentPath
 * @property {number} [imgCount]
 * @property {Function} [onSizeChange]
 * @property {Function} [onChdir]
 * @property {number} [thumbnailSize]
 */

/**
 * @param {TopBarProps} props 
 * @returns Div
 */
export function topBar (props) {
	const savedSize = sessionStorage.getItem('thumbnailSize');
	if (savedSize) {
		size = savedSize;
	}
	else if (props.thumbnailSize) {
		size = props.thumbnailSize;
	}
	cssVar('--thumbnail-size', `${size}px`);

	return make.div({
		style: {
			width: '100vw',
			height: BAR_HEIGHT,
			backgroundColor: '#ccc',
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			position: 'fixed',
			top: '0',
			left: '0',
		}
	},[
		make.img({
			src: '../components/icons/circle-up-regular.svg',
			style: {
				height: `calc(${BAR_HEIGHT} - 2px)`,
				padding: '2px',
			},
			onclick: () => props.onChdir?.(`${props.currentPath}/..`),
		}),
		make.div({
			style:{
				display: 'flex',
				alignItems: 'center',
				gap: '5px',
			}
		},[
			make.span({
				style: {
					fontSize: '10px',
					pointerEvents: 'none',
					maxWidth: '300px',
					textOverflow: 'ellipsis',
					overflow: 'hidden',
					whiteSpace: 'nowrap',
					direction: 'rtl',
				}
			}, props.currentPath),
			make.span({
				style: {
					fontSize: '10px',
					pointerEvents: 'none',
				}
			}, props.imgCount ? `(${props.imgCount} images)` : ''),
		]),
		slider({
			id: 'size-slider',
			type: 'range',
			min: 100,
			max: 550,
			step: 10,
			value: size,
			style: {
				marginRight: BAR_HEIGHT
			},
			oninput: (e) => {
				size = e.currentTarget.value;
				sessionStorage.setItem('thumbnailSize', size);
				cssVar('--thumbnail-size', `${size}px`);
			}
		})
	])
}