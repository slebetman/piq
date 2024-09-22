import { make } from '../lib/dom-utils.mjs'

async function main () {
	const config = await api.getConfig();

	const content = JSON.stringify(config, null, 4);

	const out = make('pre', {}, content);

	document.body.appendChild(out);
}

main();