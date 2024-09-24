import { make } from "../lib/dom-utils.mjs";

/**
 * @typedef {Object} EmptyPageProps
 * @property {Function} [onOpen]
 */

/**
 * @param {EmptyPageProps} [props]
 * @returns page
 */
export function emptyPage (props) {
	return make.div({
		id: 'container',
		style: {
			display: 'flex',
			width: '100vw',
			height: '100vh',
			alignItems: 'center',
			justifyContent: 'center',
			flexDirection: 'column',
			gap: '5px',
		}
	},[
		make.button({
			onclick: async () => {
				const result = await api.openDir();
				if (result) {
					props?.onOpen?.(result);
				}
			}
		},'Open Folder')
	])
}