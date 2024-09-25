import { make } from "../../lib/dom-utils.mjs";

export const BAR_HEIGHT = '24px';

/**
 * @typedef {Object} TopBarProps
 * @property {string} currentPath
 * @property {number} [size]
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
	])
}