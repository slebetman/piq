import { emptyPage } from '../components/empty-page.mjs';
import { fileList } from '../components/file-list.mjs';
import { BAR_HEIGHT } from '../components/lib/top-bar.mjs';
import { cssVar, render } from '../lib/dom-utils.mjs'

cssVar('--thumbnail-size', '150px');
cssVar('--bar-height', BAR_HEIGHT);

async function main () {
	function handleOpenDir ({files, path: currentPath}) {
		sessionStorage.setItem('currentPath', currentPath);

		render(document.body, fileList({
			files,
			currentPath,
			size: 150,
			onChdir: async (path) => {
				const normalPath = await api.normalizePath(path);
				const newFiles = await api.listDir(path);
				handleOpenDir({ files: newFiles, path: normalPath });
			}
		}))
	}

	const lastPath = sessionStorage.getItem('currentPath');

	if (lastPath) {
		const files = await api.listDir(lastPath)		;
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