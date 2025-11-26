const { contextBridge, ipcRenderer } = require('electron');

function basename (x) {
	return x.split(/\/|\\/).pop();
}

function dirname (x) {
	const p = x.split(/\/|\\/);
	p.pop();
	return p.join('/');
}

let currentCollection = '';

contextBridge.exposeInMainWorld('api', {
	getConfig: () => {
		return ipcRenderer.invoke('config');
	},
	collectionListener: (callback) => {
		ipcRenderer.on('collection', async (e, col) => {
			currentCollection = col;
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
		await ipcRenderer.invoke('context-menu-col', currentCollection, filePath, thumbnailSize);
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
	deleteCollection: async (col) => {
		await ipcRenderer.invoke('delete-collection', col);
		ipcRenderer.invoke('close-window');
	},
	confirm: async (col) => {
		const response = await ipcRenderer.invoke('show-confirm',
			'Delete collection',
			`Are you sure you want to delete "${col}"?`,
			['Delete', 'Cancel']
		);

		return response.response === 0;
	}
})