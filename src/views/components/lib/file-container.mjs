import { make } from "../../lib/dom-utils.mjs";
import { isImage } from "../../lib/image-files.mjs";

const thumbnailCache = {};

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
		icon.src = '../components/icons/folder-solid.svg';

		return make.div({
			className: 'thumbnail thumbnail-icon',
			ondblclick: props.onOpen
		},[ icon, fileName ])
	}
	else if (isImage(props.file.name)) {
		const imgPath = `${props.file.parentPath}/${props.file.name}`;

		const imgDiv = make.div({
			className: 'thumbnail',
			ondblclick: props.onOpen,
			onauxclick: (e) => {
				if (e.button === 2) {
					api.contextMenu(imgPath);
				}
			},
		},[]);

		if (thumbnailCache[imgPath]) {
			props.registerRenderer(async () => {
				const done = new Promise((ok) => {
					icon.onload = ok;
				})
				icon.src = thumbnailCache[imgPath];
				imgDiv.appendChild(icon);
				await done;
			});
		}
		else {
			props.registerRenderer(async () => {
				const done = new Promise((ok) => {
					icon.onload = ok;
				})
				const imgUrl = await api.thumbnailBuffer(imgPath);
				thumbnailCache[imgPath] = imgUrl;
				icon.src = imgUrl;
				imgDiv.appendChild(icon);
				await done;
			});
		}

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