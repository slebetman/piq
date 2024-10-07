const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
	getConfig: () => {
		return ipcRenderer.invoke('get-saved-config');
	},
	setConfig: (key, val) => {
		return ipcRenderer.invoke('set-config', key, val);
	},
	updateConfig: () => {
		return ipcRenderer.invoke('update-config');
	},
	close: () => {
		return ipcRenderer.invoke('close-window');
	},
	clearHistory: () => {
		return ipcRenderer.invoke('clear-history');
	}
});
