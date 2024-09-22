const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('api', {
	getConfig: () => {
		console.log('in preload');
		return ipcRenderer.invoke('config');
	}
})