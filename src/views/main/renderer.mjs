import { emptyPage } from '../components/empty-page.mjs';
import { fileList } from '../components/file-list.mjs';
import { render } from '../lib/dom-utils.mjs'

async function main () {
	function handleOpenDir (files) {
		// render(document.body, emptyPage({
		// 	onOpen: handleOpenDir,
		// 	currentPath: files.map(x => x.name).join(', '),
		// }));

		render(document.body, fileList({ files }))
	}

	const page = emptyPage({
		onOpen: handleOpenDir
	});


	render(document.body, page);
}

main();