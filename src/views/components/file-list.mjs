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
 * @property {number} size - Size of file icons in px
 * @property {Dirent[]} [files] - File list
 * @property {string} [currentPath]
 * @property {Function} [onOpen]
 * * @property {Function} [onChdir]
 */

/**
 * @param {FileListProps} props 
 * @returns Div
 */

export function fileList (props) {
	return make.div(
		{
			id: 'files',
			style: {
				display: 'flex',
				flexDirection: 'row',
				flexFlow: 'wrap',
				width: '100vw',
				height: '100vh',
				justifyContent: 'center',
				alignItems: 'flex-start',
				alignContent: 'flex-start',
				overflow: 'hidden',
			}
		},
		[
			topBar({
				currentPath: props.currentPath,
				onChdir: props.onChdir,
				imgCount: props.files.filter(x => isImage(x.name)).length,
				size: props.size,
			}),
			fileListContainer(props)
		]
	);
}