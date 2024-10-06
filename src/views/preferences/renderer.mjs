import { tab } from '../components/lib/tab.mjs';
import { preferences } from '../components/preferences.mjs';
import { make, render } from '../lib/dom-utils.mjs'

async function main () {
	const config = await api.getConfig();
	delete config.version;
	delete config.editors;
	let selected = 0;

	const tabs = tab({
		tabs: ['Settings', 'Editors'],
		selected,
		onClick: (name, idx) => {
			if (idx !== selected) {
				selected = idx;

				if (idx === 0) {
					cfg.replaceChild(preferencesPanel, editorsPanel);
				}
				else {
					cfg.replaceChild(editorsPanel, preferencesPanel);
				}
			}
		}
	})

	const preferencesPanel = preferences({
		config,
	});

	const editorsPanel = make.div({},'HELLO');

	const buttons = make.div({
		style: {
			display: 'flex',
			justifyContent: 'end',
			gap: '10px',
			position: 'fixed',
			bottom: 0,
			left: 0,
			width: 'calc(100vw - 40px)',
			padding: '20px',
		}
	},[
		make.button({
			onclick: () => {
				api.close();
			}
		},'Cancel'),
		make.button({
			onclick: async () => {
				for (const [key, val] of Object.entries(config)) {
					api.setConfig(key, val);
				}
				await api.updateConfig();
				api.close();
			}
		},'Save'),
	]);

	const cfg = make.div({
		style: {
			width: '100vw',
			height: '100vh',
		}
	},[
		tabs,
		preferencesPanel,
		buttons,
	]);

	render(document.body, cfg);
}

main();