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
		id: 'empty-page',
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