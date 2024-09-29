import { emptyPage } from '../components/empty-page.mjs';
import { fileList } from '../components/file-list.mjs';
import { render } from '../lib/dom-utils.mjs'

async function main () {
	api.dirListener(async (dirPath) => {
		const files = await api.listDir(dirPath);
		handleOpenDir({files, path: dirPath});
	});

	function handleOpenDir ({files, path: currentPath}) {
		sessionStorage.setItem('currentPath', currentPath);

		render(document.body, fileList({
			files,
			currentPath,
			onChdir: async (path) => {
				const normalPath = await api.normalizePath(path);
				const newFiles = await api.listDir(path);
				handleOpenDir({ files: newFiles, path: normalPath });
			},
			onOpen: async (path, index) => {
				await api.viewImage(path, files, index);
			}
		}))
	}

	const lastPath = sessionStorage.getItem('currentPath');

	if (lastPath) {
		const files = await api.listDir(lastPath);
		handleOpenDir({files, path: lastPath});
	}
	else {
		const page = emptyPage({
			onOpen: handleOpenDir
		});

		render(document.body, page);
	}
}

main();