const { contextBridge, ipcRenderer } = require('electron');

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
	listDir: async (path) => {
		return await ipcRenderer.invoke('dir-list', path);
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
	dirListener: (callback) => {
		ipcRenderer.on('dir', (e, dirPath) => {
			callback(dirPath);
		});
	},
	thumbnailListener: (callback) => {
		ipcRenderer.on('thumbnail-regenerate', (e, imgPath) => {
			callback(imgPath);
		})
	},
	updateCurrentPath: (path) => {
		ipcRenderer.send('current-path', path);
	},
	thumbnailBuffer: async (imgPath, regenerate = false) => {
		return await ipcRenderer.invoke('thumbnail-buffer-spawn', imgPath, regenerate);
	},
	watch: async (path) => {
		return await ipcRenderer.invoke('watch', path);
	},
	unwatch: async (path) => {
		return await ipcRenderer.invoke('unwatch', path);
	},
	fullScreenToggleListener: (callback) => {
		ipcRenderer.on('toggle-fullscreen', callback);
	}
})