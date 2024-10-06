import { make } from "../lib/dom-utils.mjs";
import { CheckboxInput, NumberInput, TextInput } from "./lib/input.mjs";

/**
 * @typedef {Object} EditorSpec
 * @property {string} name
 * @property {string} extensions
 */

/**
 * @typedef {Object} Config
 * @property {number} threads
 * @property {EditorSpec[]} [editors]
 * @property {boolean} useFileCache
 * @property {boolean} hideMenuBar
 * @property {boolean} debug
 * @property {number} defaultBrowserWidth
 * @property {number} defaultBrowserHeight
 * @property {number} defaultThumbnailSize
 */

/**
 * @typedef {Object} PreferencesProps
 * @property {Config} config
 * @property {Function} onCancel
 * @property {Function} onSave
 */

/**
 * @param {PreferencesProps} props 
 * @returns Div
 */

export function Preferences (props) {
	const { config, onCancel, onSave } = props;

	return make('div',{
		style: {
			width: '100vw',
			height: '100vh',
			padding: '10px',
		}
	},[
		make.div({ className: 'input-heading' }, 'Image Browser'),
		CheckboxInput({
			label: 'Hide menu',
			value: config.hideMenuBar,
			onChange: (x) => config.hideMenuBar = x,
		}),
		make.div({ className: 'input-description '},
			'this has no effect on Mac OS'
		),
		NumberInput({
			label: 'Default window width',
			value: config.defaultBrowserWidth,
			min: 200,
			onChange: (x) => config.defaultBrowserWidth = x,
		}),
		NumberInput({
			label: 'Default window height',
			value: config.defaultBrowserHeight,
			min: 200,
			onChange: (x) => config.defaultBrowserHeight = x,
		}),
		NumberInput({
			label: 'Default thumbnail size',
			min: 100,
			max: 550,
			value: config.defaultThumbnailSize,
			onChange: (x) => config.defaultThumbnailSize = x,
		}),
		make.div({ className: 'input-heading' }, 'Thumbnailer'),
		CheckboxInput({
			label: 'Use file cache',
			value: config.useFileCache,
			onChange: (x) => config.useFileCache = x,
		}),
		make.div({ className: 'input-description '},
			'thumbnails will only be stored in RAM if disabled'
		),
		TextInput({
			label: 'Number of threads',
			value: config.threads,
			onChange: (x) => {
				if (x === 'cpu_cores') {
					config.threads = x;
				}
				else {
					try {
						let t = parseInt(x, 10);
						config.threads = t;
					}
					catch (err) {
						console.log('invalid value for threads');
					}
				}
			},
		}),
		make.div({ className: 'input-description '},
			'use "cpu_cores" to create the same number as cpu cores'
		),
		make.div({
			style: {
				display: 'flex',
				justifyContent: 'end',
				gap: '10px',
				position: 'fixed',
				bottom: 0,
				left: 0,
				width: 'calc(100vw - 40px)',
				padding: '20px',
			}
		},[
			make.button({
				onclick: onCancel
			},'Cancel'),
			make.button({
				onclick: onSave
			},'Save'),
		]),
	]);
}