import { parallelRun } from '../../../services/lib/parallel.mjs';
import { make } from '../../lib/dom-utils.mjs';
import { fileContainer } from './file-container.mjs';

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
	const config = await api.getConfig();

	let count = 0;
	let total = renderers.length;
	await parallelRun(renderers, config.threads * 4, async (r) => {
		await r();
		updater?.(100*(count++)/total);
	});
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