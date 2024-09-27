import { make } from "../../lib/dom-utils.mjs";
import { fileContainer } from "./file-container.mjs";

/**
 * @typedef {Object} Dirent
 * @property {string} name
 * @property {string} parentPath
 * @property {boolean} isDirectory
 */

/**
 * @typedef {Object} FileListContainerProps
 * @property {Dirent[]} [files] - File list
 * @property {string} [currentPath]
 * @property {Function} [onOpen]
 * @property {Function} [onChdir]
 * @property {boolean} [showAll] - Show non-image files
 */

/**
 * @param {FileListContainerProps} props 
 * @returns Div
 */
export function fileListContainer (props) {
	const children = [];

	if (props.files?.length) {
		const regularFiles = [];
		const directories = [];

		for (const [idx, f] of props.files.entries()) {
			if (! f.name.startsWith('.')) {
				const container = fileContainer({
					file: f,
					onOpen: () => {
						const fullPath = `${f.parentPath}/${f.name}`;

						if (f.isDirectory) {
							props.onChdir?.(fullPath);
						}
						else {
							props.onOpen?.(fullPath,  idx);
						}
					},
					showAll: props.showAll,
				});

				if (container) {
					if (f.isDirectory) directories.push(container);
					else regularFiles.push(container);
				}
			}
		}

		children.push(...directories, ...regularFiles);
	}

	return make.div(
		{
			id: 'files-container',
		},
		children
	);
}