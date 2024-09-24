import { make } from "../lib/dom-utils.mjs";

/**
 * @typedef {Object} EmptyPageProps
 * @property {Function} [onOpen]
 * @property {string} [currentPath]
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
		props.currentPath ? make.span({},props.currentPath) : null,
		make.button({
			onclick: async () => {
				const result = await api.openDir();
				if (result) {
					props?.onOpen?.(result);
				}
			}
		},'Open Folder')
	].filter(x => x))
}