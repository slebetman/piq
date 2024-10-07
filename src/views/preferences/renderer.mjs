import { tab } from '../components/lib/tab.mjs';
import { editorPrefs, generalPrefs, appearencePrefs } from '../components/preferences.mjs';
import { make, render } from '../lib/dom-utils.mjs'

/**
 * @param {import('../../services/config.mjs').EditorSpec[]} editors 
 */
function cleanUpEditors (editors) {
	return editors.filter?.(ed => {
		if (
			ed.name?.trim?.() == '' ||
			ed.extensions?.trim?.() == ''
		) {
			return false;
		}
		return true;
	})
}

async function main () {
	const config = await api.getConfig();
	delete config.version;
	let selected = 0;

	const tabs = tab({
		tabs: ['Appearence', 'General', 'Open with..'],
		selected,
		onClick: (name, idx) => {
			if (idx !== selected) {
				selected = idx;
				cfg.replaceChild(tabPanels[selected], cfg.childNodes[1]);
			}
		}
	})

	const tabPanels = [
		appearencePrefs({ config }),
		generalPrefs({ config }),
		editorPrefs({ config }),
	];

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
				for (let [key, val] of Object.entries(config)) {
					if (key === 'editors') {
						val = cleanUpEditors(val);
					}

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
		tabPanels[selected],
		buttons,
	]);

	render(document.body, cfg);
}

main();