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
	contextMenuImg: async (filePath) => {
		await ipcRenderer.invoke('context-menu-img', filePath);
	},
	contextMenuDir: async (filePath) => {
		await ipcRenderer.invoke('context-menu-dir', filePath);
	},
	dirListener: (callback) => {
		ipcRenderer.on('dir', (e, dirPath) => {
			callback(dirPath);
		});
	},
	updateCurrentPath: (path) => {
		ipcRenderer.send('current-path', path);
	},
	thumbnailBuffer: async (imgPath) => {
		return await ipcRenderer.invoke('thumbnail-buffer-spawn', imgPath);
	},
	watch: async (path) => {
		return await ipcRenderer.invoke('watch', path);
	}
})