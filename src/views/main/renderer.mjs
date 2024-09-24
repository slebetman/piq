import { emptyPage } from '../components/empty-page.mjs';
import { fileList } from '../components/file-list.mjs';
import { render } from '../lib/dom-utils.mjs'

async function main () {
	function handleOpenDir (files) {
		render(document.body, fileList({
			files,
			size: 150,
			onChdir: async (path) => {
				const newFiles = await api.listDir(path);
				handleOpenDir(newFiles);
			}
		}))
	}

	const page = emptyPage({
		onOpen: handleOpenDir
	});


	render(document.body, page);
}

main();