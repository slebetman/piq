import { make } from '../../lib/dom-utils.mjs';

/**
 * @typedef {Object} InputProps
 * @property {string} label
 * @property {any} value
 * @property {(any) => void} onChange
 * @property {Record<string,any>} [containerStyle]
 * @property {Record<string,any>} [inputStyle]
 * @property {Record<string,any>} [labelStyle]
 */

/**
 * @param {InputProps} props 
 * @returns Div containing inputs
 */
export function textInput (props) {
	return make.div({
		className: 'input-group text-input',
		style: {
			display: 'flex',
			...(props.containerStyle ?? {})
		}
	},[
		make('label',{
			className: 'input-label',
			style: props.labelStyle ?? {}
		}, props.label),
		make('input',{
			className: 'input-value',
			type: 'text',
			value: props.value,
			onchange: (e) => {
				props.onChange(e.target.value);
			},
			style: props.inputStyle,
		})
	]);
}

/**
 * @typedef {Object} NumberInputPropType
 * @property {number} min
 * @property {number} max
 */

/** @typedef {NumberInputPropType & InputProps} NumberInputProps */

/**
 * @param {NumberInputProps} props 
 * @returns Div containing inputs
 */
export function numberInput (props) {
	return make.div({
		className: 'input-group text-input',
		style: {
			display: 'flex',
			...(props.containerStyle ?? {})
		}
	},[
		make('label',{
			className: 'input-label',
			style: props.labelStyle ?? {}
		}, props.label),
		make('input',{
			className: 'input-value',
			type: 'number',
			value: props.value,
			min: props.min,
			max: props.max,
			onchange: (e) => {
				try {
					const val = parseInt(e.target.value);
					e.target.value = val;
					props.onChange(val);
				}
				catch (err) {
					console.log(err);
				}
			},
			style: props.inputStyle,
		})
	]);
}

/**
 * @param {InputProps} props 
 * @returns Div containing inputs
 */
export function checkboxInput (props) {
	return make.div({
		className: 'input-group text-input',
		style: {
			display: 'flex',
			...(props.containerStyle ?? {})
		}
	},[
		make('label',{
			className: 'input-label',
			style: props.labelStyle ?? {}
		}, props.label),
		make('input',{
			className: 'input-value',
			type: 'checkbox',
			checked: props.value,
			onchange: (e) => {
				props.onChange(e.target.checked);
			},
			style: {
				width: 'auto',
				...(props.inputStyle ?? {})
			},
		})
	]);
}