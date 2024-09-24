import { make } from "../../lib/dom-utils.mjs";

/**
 * @typedef {Object} FileContainerProps
 * @property {number} size - Size of file icons in px
 * @property {Dirent[]} [files] - File list
 * @property {Function} [onOpen]
 */

/**
 * @param {FileContainerProps} props 
 * @returns Div
 */
export function fileContainer (props) {
	const containerStyle = {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		width: `${props.size ?? 80}px`,
		height: `${props.size ?? 80}px`,
		overflow: 'hidden',
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
			maxWidth: `${props.size ?? 80}px`,
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			color: '#ccc',
		}
	},props.file.name)

	if (props.file.isDirectory) {
		icon.src = '../components/lib/folder.svg';
		icon.style.maxHeight = '80%';

		return make.div({
			style: containerStyle,
			ondblclick: props.onOpen
		},[ icon, fileName ])
	}
	else if (props.file.name.match(/jpe?g|png|webp/gi)) {
		icon.src = `${props.file.parentPath}/${props.file.name}`;

		return make.div({
			style: containerStyle
		},[ icon ])
	}
	else {
		icon.src = '../components/lib/file.svg';
		icon.style.maxHeight = '80%';

		return make.div({
			style: containerStyle
		},[ icon, fileName ])
	}
}