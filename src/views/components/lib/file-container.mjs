import { cssVar, make } from '../../lib/dom-utils.mjs';
import { isImage } from '../../lib/image-files.mjs';

/** @type {Record<string,HTMLElement>} */
export let imgCache = {};

/**
 * @typedef {Object} FileContainerProps
 * @property {Dirent[]} files - File list
 * @property {Function} [onOpen]
 * @property {Function} registerRenderer
 * @property {boolean} [showAll] - Show non-image files
 */

/**
 * @param {FileContainerProps} props 
 * @returns Div or null
 */
export function fileContainer (props) {
	const icon = make.img({
		title: props.file.name,
		className: 'thumbnail-img',
	});

	const fileName = make.div({
		className: 'thumbnail-name',
	},props.file.name)

	if (props.file.isDirectory) {
		const dirPath = `${props.file.parentPath}/${props.file.name}`;
		icon.src = '../components/icons/folder-solid.svg';

		return make.div({
			className: 'thumbnail thumbnail-icon',
			ondblclick: props.onOpen,
			onauxclick: (e) => {
				console.log('DIR');
				if (e.button === 2) {
					const thumbnailSize = parseInt(cssVar('--thumbnail-size'), 10);
					api.contextMenuDir(dirPath, thumbnailSize);
				}
				e.stopPropagation();
			},
		},[ icon, fileName ])
	}
	else if (isImage(props.file.name)) {
		const imgPath = `${props.file.parentPath}/${props.file.name}`;

		if (imgCache[imgPath]) {
			return imgCache[imgPath];
		}

		const imgDiv = make.div({
			className: 'thumbnail',
			ondblclick: props.onOpen,
			onauxclick: (e) => {
				console.log('IMG');
				if (e.button === 2) {
					const thumbnailSize = parseInt(cssVar('--thumbnail-size'), 10);
					api.contextMenuImg(imgPath, thumbnailSize);
				}
				e.stopPropagation();
			},
		},[]);

		imgDiv.dataset.path = imgPath;
		imgDiv.dataset.rotate = 0;
		imgDiv.dataset.flipX = false;
		imgDiv.dataset.flipY = false;

		props.registerRenderer(async () => {
			const done = new Promise((ok) => {
				icon.onload = ok;
			})
			icon.src = await api.thumbnailBuffer(imgPath);
			imgDiv.appendChild(icon);
			imgCache[imgPath] = imgDiv;
			await done;
		});

		return imgDiv;
	}
	else if (props.showAll) {
		icon.src = '../components/icons/file-solid.svg';

		return make.div({
			className: 'thumbnail thumbnail-icon',
		},[ icon, fileName ])
	}
	else {
		return null;
	}
}