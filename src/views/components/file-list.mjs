import { make } from "../lib/dom-utils.mjs";
import { isImage } from "../lib/image-files.mjs";
import { fileListContainer } from "./lib/file-list-container.mjs";
import { BAR_HEIGHT, topBar } from "./lib/top-bar.mjs";

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
 * @property {number} [thumbnailSize]
 */

/**
 * @param {FileListProps} props 
 * @returns Div
 */
export function fileList (props) {
	const progressBar = make.div({
		id: 'file-load-progress',
		style: {
			height: '4px',
			backgroundColor: '#58f',
			width: 0,
			display: 'none',
			position: 'fixed',
			top: BAR_HEIGHT,
			opacity: 0.75,
		}
	});

	return make.div(
		{
			id: 'files',
		},
		[
			topBar({
				currentPath: props.currentPath,
				onChdir: props.onChdir,
				imgCount: props.files.filter(x => isImage(x.name)).length,
				thumbnailSize: props.thumbnailSize,
			}),
			fileListContainer({
				...props,
				updater: (percent) => {
					if (percent === 0) {
						progressBar.style.display = 'none';
					}
					else {
						progressBar.style.display = 'block';
					}
					progressBar.style.width = `${percent}%`;
				}
			}),
			progressBar
		]
	);
}