import { CheckboxInput, NumberInput, TextInput } from '../components/lib/input.mjs';
import { make, render } from '../lib/dom-utils.mjs'

async function main () {
	const config = await api.getConfig();
	delete config.version;
	delete config.editors;

	const cfg = make('div',{
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
				onclick: () => {
					api.close();
				}
			},'Cancel'),
			make.button({
				onclick: () => {
					console.log(config);
				}
			},'Save'),
		]),
	]);

	render(document.body, cfg);
}

main();