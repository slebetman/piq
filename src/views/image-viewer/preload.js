const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	imgListener: (callback) => {
		ipcRenderer.on('image', (e, stat) => {
			callback(stat);
		})
	}
})