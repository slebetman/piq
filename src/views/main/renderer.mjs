import { emptyPage } from '../components/empty-page.mjs';
import { render } from '../lib/dom-utils.mjs'

async function main () {
	function handleOpenDir (path) {
		render(document.body, emptyPage({
			onOpen: handleOpenDir,
			currentPath: path.map(x => x.name).join(', '),
		}));
	}

	const page = emptyPage({
		onOpen: handleOpenDir
	});


	render(document.body, page);
}

main();