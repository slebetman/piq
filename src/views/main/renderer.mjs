import { emptyPage } from '../components/empty-page.mjs';
import { render } from '../lib/dom-utils.mjs'

async function main () {
	function handleOpenPage (path) {
		render(document.body, emptyPage({
			onOpen: handleOpenPage,
			currentPath: path,
		}));
	}

	const page = emptyPage({
		onOpen: handleOpenPage
	});


	render(document.body, page);
}

main();