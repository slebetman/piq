import { make } from "../lib/dom-utils.mjs";
import { isImage } from "../lib/image-files.mjs";
import { fileListContainer } from "./lib/file-list-container.mjs";
import { topBar } from "./lib/top-bar.mjs";

/**
 * @typedef {Object} Dirent
 * @property {string} name
 * @property {string} parentPath
 * @property {boolean} isDirectory
 */

/**
 * @typedef {Object} FileListProps
 * @property {Dirent[]} [files] - File list
 * @property {string} [currentPath]
 * @property {Function} [onOpen]
 * @property {Function} [onChdir]
 */

/**
 * @param {FileListProps} props 
 * @returns Div
 */

export function fileList (props) {
	return make.div(
		{
			id: 'files',
		},
		[
			topBar({
				currentPath: props.currentPath,
				onChdir: props.onChdir,
				imgCount: props.files.filter(x => isImage(x.name)).length,
			}),
			fileListContainer(props)
		]
	);
}