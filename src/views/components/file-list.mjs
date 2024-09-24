import { make } from "../lib/dom-utils.mjs";
import { fileContainer } from "./lib/file-container.mjs";

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
 * @property {Function} [onOpen]
 * * @property {Function} [onChdir]
 */

/**
 * @param {FileListProps} props 
 * @returns Div
 */

export function fileList (props) {
	const children = [];

	if (props.files?.length) {
		const regularFiles = [];
		const directories = [fileContainer({
			size: props.size,
			file:{
				name: '..',
				parentPath: props.files[0].parentPath,
				isDirectory: true,
			},
			onOpen: () => {
				props.onChdir?.(`${props.files[0].parentPath}/..`);
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
				overflowX: 'hidden',
			}
		},
		children
	);
}