import { Preferences } from '../components/preferences.mjs';
import { render } from '../lib/dom-utils.mjs'

async function main () {
	const config = await api.getConfig();
	delete config.version;
	delete config.editors;

	const cfg = Preferences({
		config,
		onCancel: () => {
			api.close();
		},
		onSave: async () => {
			for (const [key, val] of Object.entries(config)) {
				api.setConfig(key, val);
			}
			await api.updateConfig();
			api.close();
		}
	});

	render(document.body, cfg);
}

main();