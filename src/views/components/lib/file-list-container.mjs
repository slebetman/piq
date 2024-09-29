import { cssVar, make } from "../../lib/dom-utils.mjs";
import { fileContainer } from "./file-container.mjs";

/**
 * @typedef {Object} Dirent
 * @property {string} name
 * @property {string} parentPath
 * @property {boolean} isDirectory
 */

/**
 * @typedef {Object} FileListContainerProps
 * @property {Dirent[]} files - File list
 * @property {string} [currentPath]
 * @property {Function} [onOpen]
 * @property {Function} [onChdir]
 * @property {Function} [updater]
 * @property {boolean} [showAll] - Show non-image files
 */

const renderers = [];

async function runRenderers (updater) {
	let count = 0;
	let total = renderers.length;
	while (renderers.length) {
		const batch = renderers.splice(0, 24);
		count += batch.length;
		updater?.(100*count/total);
		await Promise.all(batch.map(r => r()));
	}
	updater?.(0);
}

/**
 * @param {FileListContainerProps} props 
 * @returns Div
 */
export function fileListContainer (props) {
	props.updater?.(0);
	const children = [];
	renderers.splice(0, renderers.length); // clear renderers;

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
					registerRenderer: (rendererFunc) => {
						renderers.push(rendererFunc);
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

		if (renderers.length) {
			runRenderers(props.updater);
		}
	}

	return make.div(
		{
			id: 'files-container',
		},
		children
	);
}