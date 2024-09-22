import { make, render } from '../lib/dom-utils.mjs'

async function main () {
	const btn = make('button',{
		onclick: () => {
			api.openDir();
		}
	},'Open Folder');

	const page = make('div',{
		style: {
			display: 'flex',
			width: '100vw',
			height: '100vh',
			alignItems: 'center',
			justifyContent: 'center',
		}
	},[btn])

	render(document.body, page);
}

main();