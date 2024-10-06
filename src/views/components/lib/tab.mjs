import { make } from "../../lib/dom-utils.mjs";

/**
 * @typedef {Object} TabProps
 * @property {string[]} tabs
 * @property {number} selected
 * @property {Function} onClick
 */

/**
 * @param {TabProps} props 
 * @returns Div
 */
export function tab (props) {
	const tabs = props.tabs.map((x, idx) => {
		let className = 'tab-item';

		if (idx === props.selected) {
			className += ' selected';
		}

		return make.div({
			className,
			onclick: (e) => {
				for (const t of tabs) {
					t.className = 'tab-item';
				}
				e.target.className += ' selected';
				props.onClick?.(x, idx);
			},
		},x);
	})

	return make.div({
		className: 'tab-container'
	},tabs);
}