import { emptyPage } from '../components/empty-page.mjs';
import { fileList } from '../components/file-list.mjs';
import { render } from '../lib/dom-utils.mjs'

async function main () {
	function handleOpenDir ({files, path: currentPath}) {
		render(document.body, fileList({
			files,
			currentPath,
			size: 150,
			onChdir: async (path) => {
				const newFiles = await api.listDir(path);
				handleOpenDir({files: newFiles, path: newFiles[0].parentPath});
			}
		}))
	}

	const page = emptyPage({
		onOpen: handleOpenDir
	});


	render(document.body, page);
}

main();