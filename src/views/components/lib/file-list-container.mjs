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
 * * @property {Function} [onChdir]
 */

/**
 * @param {FileListContainerProps} props 
 * @returns Div
 */
export function fileListContainer (props) {
	const children = [];

	if (props.files?.length) {
		const regularFiles = [];
		const directories = [fileContainer({
			size: props.size,
			file:{
				name: '..',
				parentPath: props.currentPath,
				isDirectory: true,
			},
			onOpen: () => {
				props.onChdir?.(`${props.currentPath}/..`);
			}
		})];

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
					}
				});

				if (f.isDirectory) directories.push(container);
				else regularFiles.push(container);
			}
		}

		children.push(...directories, ...regularFiles);
	}

	return make.div(
		{
			id: 'files-container',
			style: {
				display: 'flex',
				flexDirection: 'row',
				flexFlow: 'wrap',
				width: '100%',
				height: 'calc(100vh - 18px)',
				justifyContent: 'center',
				alignItems: 'flex-start',
				alignContent: 'flex-start',
				overflowX: 'hidden',
				overflowY: 'auto',
			}
		},
		children
	);
}