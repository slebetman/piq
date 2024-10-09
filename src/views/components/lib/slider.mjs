import { make } from "../../lib/dom-utils.mjs";

/**
 * @typedef {Object} SliderProps
 * @property {Function} oninput
 * @property {string} id
 * @property {number} min
 * @property {number} max
 * @property {number} step
 * @property {number} value
 * @property {Object} style
 */

/**
 * @param {SliderProps} props 
 * @returns Div
 */
export function slider (props) {
	let value = props.value;

	const valueLabel = make.span({
		style: {
			width: '25px',
			fontSize: '10px',
			pointerEvents: 'none',
		}
	}, `${value}`);

	return make.div({
		style: {
			display: 'flex',
			alignItems: 'center',
			...(props.style ?? {}),
		}
	},[
		make('input',{
			...props,
			type: 'range',
			oninput: (e) => {
				props.oninput(e);
				value = e.currentTarget.value;
				valueLabel.textContent = value;
			}
		}),
		valueLabel,
	]);
}