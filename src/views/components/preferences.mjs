import { make, render } from '../lib/dom-utils.mjs';
import { checkboxInput, numberInput, textInput } from './lib/input.mjs';

/**
 * @typedef {Object} PreferencesProps
 * @property {import('../../services/config.mjs').Config} config
 */

/**
 * @param {PreferencesProps} props 
 * @returns Div
 */
export function appearencePrefs (props) {
	const { config } = props;

	return make('div',{
		id: 'preferences-panel',
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
	]);
}

/**
 * @param {PreferencesProps} props 
 * @returns Div
 */
export function generalPrefs (props) {
	const { config } = props;

	return make('div',{
		id: 'history-panel',
		style: {
			padding: '10px',
		}
	},[
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
						console.error('invalid value for threads');
					}
				}
			},
		}),
		make.div({ className: 'input-description '},
			'use "cpu_cores" to create the same number as cpu cores'
		),
		make.div({
			style: {
				marginTop: '10px',
				marginLeft: '20px',
			}
		},[
			make.button({
				onclick: async () => {
					const ok = await api.dialog({
						message: 'Delete thumbnail cache?',
						type: 'warning',
						buttons:[ 'Cancel', 'Delete' ]
					});
					if (ok.response === 1) {
						await api.clearCache();
					}
				}
			}, 'Clear file cache')
		]),
		make.div({ className: 'input-heading' }, 'Open Recent'),
		numberInput({
			label: 'History size',
			value: config.recentFolderHistory,
			min: 2,
			max: 100,
			onChange: (x) => config.recentFolderHistory = x,
		}),
		make.div({
			style: {
				marginTop: '10px',
				marginLeft: '20px',
			}
		},[
			make.button({
				onclick: async () => {
					const ok = await api.dialog({
						message: 'Delete recently opened folder history?',
						type: 'warning',
						buttons:[ 'Cancel', 'Delete' ]
					});
					if (ok.response === 1) {
						api.clearHistory();
					}
				}
			}, 'Clear history')
		]),
	]);
}

/**
 * @param {import('../../services/config.mjs').EditorSpec[]} editors
 * @param {Function} onDelete
 * @returns Div array
 */
function drawEditors (editors, onDelete) {
	return editors?.map(ed => {
		const { name, extensions } = ed;

		return make.div({
			style: {
				display: 'flex',
				alignItems: 'end',
			}
		},[
			textInput({
				label: 'Program',
				labelStyle: {
					width: '30%',
				},
				inputStyle: {
					width: '60%',
				},
				value: name,
				onChange: (val) => ed.name = val,
			}),
			textInput({
				label: 'Extensions',
				labelStyle: {
					width: '30%',
				},
				inputStyle: {
					width: '60%',
				},
				value: extensions,
				onChange: (val) => ed.extensions = val,
			}),
			make.div({
				className: 'editor-delete',
				onclick: () => {
					onDelete(ed);
				}
			},'✕'),
		])
	})
}

/**
 * @param {PreferencesProps} props 
 * @returns Div
 */
export function editorPrefs (props) {
	const { config } = props;

	/**
	 * @param {EditorSpec} ed 
	 */
	function handleDelete (ed) {
		const toDelete = config.editors?.findIndex(x => x === ed);
		if (toDelete !== -1) {
			config.editors.splice(toDelete, 1);
			render(editors, drawEditors(config.editors, handleDelete));
		}
	}

	const editors = make.div({
		className: 'editors-list'
	}, drawEditors(config.editors, handleDelete));

	return make('div',{
		id: 'editors-panel',
	}, [
		make.div({ className: 'input-heading' }, 'File Associations'),
		make.div({ className: 'input-description '},`
			Do not include the dot (".") in the extension list.
			Use star ("*") to match any character.<br>
			Separate extensions with the pipe ("|") character.
			For example: "jp*g|png" will match jpg, jpeg and png.
		`),
		make.div({
			style: {
				display: 'flex',
				justifyContent: 'flex-end',
				marginTop: '3px',
			}
		},[
			make.button({
				onclick: () => {
					config.editors.push({
						name: '',
						extensions: '',
					});
					const editorList = drawEditors(config.editors, handleDelete);
					render(editors, editorList);
				}
			}, '+ Add program')
		]),
		editors,
	]);
}