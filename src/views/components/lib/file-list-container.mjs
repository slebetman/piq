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
 * @property {number} size - Size of file icons in px
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

		for (const f of props.files) {
			if (! f.name.startsWith('.')) {
				const container = fileContainer({
					file: f,
					size: props.size,
					onOpen: () => {
						const fullPath = `${f.parentPath}/${f.name}`;

						if (f.isDirectory) {
							props.onChdir?.(fullPath);
						}
						else {
							props.onOpen?.(fullPath);
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
			style: {
				display: 'grid',
				gridTemplateColumns: `repeat(auto-fill, ${props.size ?? 80}px)`,
				gridGap: 0,
				width: '100%',
				height: 'calc(100vh - 18px)',
				justifyContent: 'space-around',
				overflowX: 'hidden',
				overflowY: 'auto',
			}
		},
		children
	);
}