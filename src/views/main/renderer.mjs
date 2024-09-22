import { make } from '../lib/dom-utils.mjs'

async function main () {
	const btn = make('button',{
		onclick: () => {
			api.openDir();
		}
	},'Open Folder');

	document.body.appendChild(btn);
}

main();