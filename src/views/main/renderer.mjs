import { emptyPage } from '../components/empty-page.mjs';
import { fileList } from '../components/file-list.mjs';
import { render } from '../lib/dom-utils.mjs'

const scrollPosition = {};

async function main () {
	api.dirListener(async (dirPath) => {
		const files = await api.listDir(dirPath);
		handleOpenDir({files, path: dirPath});
	});

	function handleOpenDir ({files, path: currentPath}) {
		const oldPath = sessionStorage.getItem('currentPath');
		sessionStorage.setItem('currentPath', currentPath);
		document.title = currentPath.split('/').pop();
		api.updateCurrentPath(currentPath);

		render(document.body, fileList({
			files,
			currentPath,
			onChdir: async (path) => {
				scrollPosition[currentPath] = document.getElementById('files-container').scrollTop;

				const normalPath = await api.normalizePath(path);
				const newFiles = await api.listDir(path);
				handleOpenDir({ files: newFiles, path: normalPath });
			},
			onOpen: async (path, index) => {
				await api.viewImage(path, files, index);
			}
		}));

		if (scrollPosition[currentPath]) {
			document.getElementById('files-container').scrollTop = scrollPosition[currentPath];
		}

		let debounce;

		if (oldPath) {
			api.unwatch(oldPath);
		}

		api.watch(currentPath).then(async (x) => {
			if (x) {
				clearTimeout(debounce);
				debounce = setTimeout(async () => {
					const normalPath = await api.normalizePath(currentPath);
					const newFiles = await api.listDir(currentPath);
					handleOpenDir({ files: newFiles, path: normalPath });
				}, 500);
			}
		});
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