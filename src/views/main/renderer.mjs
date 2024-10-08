import { emptyPage } from '../components/empty-page.mjs';
import { fileList } from '../components/file-list.mjs';
import { imgCache } from '../components/lib/file-container.mjs';
import { render } from '../lib/dom-utils.mjs'

const scrollPosition = JSON.parse(sessionStorage.getItem('scroll') ?? '{}');

async function main () {
	const config = await api.getConfig();

	api.dirListener(async (dirPath) => {
		const files = await api.listDir(dirPath);
		handleOpenDir({files, path: dirPath});
	});

	api.thumbnailListener(async (imgPath) => {
		const img = imgCache[imgPath].getElementsByTagName('img')[0];

		if (img) {
			img.src = await api.thumbnailBuffer(imgPath, true);
		}
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
				sessionStorage.setItem('scroll', JSON.stringify(scrollPosition));

				const normalPath = await api.normalizePath(path);
				const newFiles = await api.listDir(path);
				handleOpenDir({ files: newFiles, path: normalPath });
			},
			onOpen: async (path, index) => {
				await api.viewImage(path, files, index);
			},
			thumbnailSize: config.defaultThumbnailSize,
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
				scrollPosition[currentPath] = document.getElementById('files-container').scrollTop;
				sessionStorage.setItem('scroll', JSON.stringify(scrollPosition));
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

	window.onbeforeunload = () => {
		scrollPosition[sessionStorage.setItem('currentPath')] = document.getElementById('files-container').scrollTop;
		sessionStorage.setItem('scroll', JSON.stringify(scrollPosition));
	}
}

main();