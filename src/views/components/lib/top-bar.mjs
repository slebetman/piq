import { cssVar, make } from "../../lib/dom-utils.mjs";
import { slider } from "./slider.mjs";

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
 */

/**
 * @param {TopBarProps} props 
 * @returns Div
 */
export function topBar (props) {
	return make.div({
		style: {
			width: '100vw',
			height: BAR_HEIGHT,
			backgroundColor: '#ccc',
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
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
			oninput: (e) => {
				size = e.currentTarget.value;
				cssVar('--thumbnail-size', `${size}px`);
			}
		})
	])
}