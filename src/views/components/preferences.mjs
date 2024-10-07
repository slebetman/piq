import { make } from "../lib/dom-utils.mjs";
import { checkboxInput, numberInput, textInput } from "./lib/input.mjs";

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
 */

/**
 * @param {PreferencesProps} props 
 * @returns Div
 */
export function preferences (props) {
	const { config } = props;

	return make('div',{
		id: 'config-tab',
		style: {
			padding: '10px',
		}
	},[
		make.div({ className: 'input-heading' }, 'Image Browser'),
		checkboxInput({
			label: 'Hide menu',
			value: config.hideMenuBar,
			onChange: (x) => config.hideMenuBar = x,
		}),
		make.div({ className: 'input-description '},
			'this has no effect on Mac OS'
		),
		numberInput({
			label: 'Default window width',
			value: config.defaultBrowserWidth,
			min: 200,
			onChange: (x) => config.defaultBrowserWidth = x,
		}),
		numberInput({
			label: 'Default window height',
			value: config.defaultBrowserHeight,
			min: 200,
			onChange: (x) => config.defaultBrowserHeight = x,
		}),
		numberInput({
			label: 'Default thumbnail size',
			min: 100,
			max: 550,
			value: config.defaultThumbnailSize,
			onChange: (x) => config.defaultThumbnailSize = x,
		}),
		make.div({ className: 'input-heading' }, 'Thumbnailer'),
		checkboxInput({
			label: 'Use file cache',
			value: config.useFileCache,
			onChange: (x) => config.useFileCache = x,
		}),
		make.div({ className: 'input-description '},
			'thumbnails will only be stored in RAM if disabled'
		),
		textInput({
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
	]);
}

/**
 * @param {PreferencesProps} props 
 * @returns Div
 */
export function editors (props) {
	const { config } = props;

	const editors = config.editors?.map(ed => {
		const { name, extensions } = ed;

		return make.div({
			style: {
				display: 'flex',
				alignItems: 'end',
			}
		},[
			textInput({
				label: 'Extensions',
				labelStyle: {
					width: '30%',
				},
				inputStyle: {
					width: '60%',
				},
				value: extensions
			}),
			textInput({
				label: 'Program',
				labelStyle: {
					width: '30%',
				},
				inputStyle: {
					width: '60%',
				},
				value: name
			}),
			make.div({
				className: 'editor-delete',
			},'✕'),
		])
	})

	return make('div',{
		id: 'editors-tab',
		style: {
			padding: '10px',
			display: 'flex',
			flexDirection: 'column',
			height: 'calc(100vh - 100px)',
		}
	}, [
		make.div({ className: 'input-heading' }, 'File Associations'),
		make.div({ className: 'input-description '},`
			Do not include the dot (".") in the extension list.
			Use star ("*") to match any character.<br>
			Separate extensions with the pipe ("|") character.
			For example: "jp*g|png" will match jpg, jpeg and png.
		`),
		make.div({
			className: 'editors-list'
		}, editors),
	]);
}