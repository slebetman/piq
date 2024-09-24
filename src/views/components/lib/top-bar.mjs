
import { make } from "../../lib/dom-utils.mjs";

/**
 * @typedef {Object} TopBarProps
 * @property {string} currentPath
 * @property {number} [size]
 * @property {Function} [onSizeChange]
 */

/**
 * @param {TopBarProps} props 
 * @returns Div
 */
export function topBar (props) {
	return make.div({
		style: {
			width: '100vw',
			height: '18px',
			backgroundColor: '#ccc',
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
		}
	},[
		make.span({
			style: {
				fontSize: '10px',
				pointerEvents: 'none',
			}
		}, props.currentPath),
	])
}