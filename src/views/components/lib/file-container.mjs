import { make } from "../../lib/dom-utils.mjs";

export const DEFAULT_SIZE = 80;

/**
 * @typedef {Object} FileContainerProps
 * @property {number} size - Size of file icons in px
 * @property {Dirent[]} [files] - File list
 * @property {Function} [onOpen]
 * @property {boolean} [showAll] - Show non-image files
 */

function safePath (txt) {
	return txt.split('/')
		.map(x => encodeURIComponent(x))
		.join('/');
}

/**
 * @param {FileContainerProps} props 
 * @returns Div or null
 */
export function fileContainer (props) {
	const containerStyle = {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		width: `${props.size ?? DEFAULT_SIZE}px`,
		height: `${props.size ?? DEFAULT_SIZE}px`,
		overflow: 'hidden',
		color: '#ccc',
	};

	const icon = make.img({
		title: props.file.name,
		style: {
			width: '100%',
			height: '100%',
			objectFit: 'contain',
		}
	});

	const fileName = make.div({
		style: {
			fontSize: '10px',
			maxWidth: `${props.size ?? DEFAULT_SIZE}px`,
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			whiteSpace: 'nowrap',
		}
	},props.file.name)

	if (props.file.isDirectory) {
		icon.src = '../components/icons/folder-solid.svg';
		icon.style.maxHeight = '80%';
		icon.style.filter = 'invert(0.5)';

		return make.div({
			style: containerStyle,
			ondblclick: props.onOpen
		},[ icon, fileName ])
	}
	else if (props.file.name.match(/jpe?g|png|webp|svg|gif/gi)) {
		icon.src = safePath(`${props.file.parentPath}/${props.file.name}`);
		icon.style.scale = 1.2;

		return make.div({
			style: containerStyle
		},[ icon ])
	}
	else if (props.showAll) {
		icon.src = '../components/icons/file-solid.svg';
		icon.style.maxHeight = '80%';
		icon.style.filter = 'invert(0.5)';

		return make.div({
			style: containerStyle
		},[ icon, fileName ])
	}
	else {
		return null;
	}
}