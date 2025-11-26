const { contextBridge, ipcRenderer } = require('electron');

function basename (x) {
	return x.split(/\/|\\/).pop();
}

function dirname (x) {
	const p = x.split(/\/|\\/);
	p.pop();
	return p.join('/');
}

contextBridge.exposeInMainWorld('api', {
	getConfig: () => {
		return ipcRenderer.invoke('config');
	},
	openDir: async () => {
		const dir = await ipcRenderer.invoke('open');

		if (!dir.canceled) {
			const path = dir.filePaths[0];

			const files = await ipcRenderer.invoke('dir-list', path);
			return { files, path };
		}

		return null;
	},
	collectionListener: (callback) => {
		ipcRenderer.on('collection', async (e, col) => {
			console.log('HERE');
			const files = await ipcRenderer.invoke('get-collection', col);
			callback(files.map(x => ({
				name: basename(x),
				parentPath: dirname(x),
				isDirectory: false,	
			})), col);
		})
	},
	normalizePath: async (path) => {
		return await ipcRenderer.invoke('path-normalize', path);
	},
	imgInfo: async (path) => {
		return await ipcRenderer.invoke('img-info', path);
	},
	viewImage: async (path, files, index) => {
		return await ipcRenderer.invoke('viewer', path, files, index);
	},
	contextMenuImg: async (filePath, thumbnailSize) => {
		await ipcRenderer.invoke('context-menu-img', filePath, thumbnailSize);
	},
	contextMenuDir: async (filePath, thumbnailSize) => {
		await ipcRenderer.invoke('context-menu-dir', filePath, thumbnailSize);
	},
	thumbnailListener: (callback) => {
		ipcRenderer.on('thumbnail-regenerate', (e, imgPath) => {
			callback(imgPath);
		})
	},
	thumbnailTransformListener: (callback) => {
		ipcRenderer.on('thumbnail-transform', (e, imgPath, transform) => {
			callback(imgPath, transform); // flipX, flipY, rotateLeft, rotateRight
		})
	},
	thumbnailBuffer: async (imgPath, regenerate = false) => {
		return await ipcRenderer.invoke('thumbnail-buffer-spawn', imgPath, regenerate);
	},
	fullScreenToggleListener: (callback) => {
		ipcRenderer.on('toggle-fullscreen', callback);
	},
})