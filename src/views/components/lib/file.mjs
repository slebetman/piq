import { make } from "../../lib/dom-utils.mjs";

export function fileContainer (props) {
	const icon = make.img({
		src: props.file.isDirectory ?
			'../components/lib/folder.svg' :
			'../components/lib/file.svg',
		width: props.size ?? 80,
		height: props.size ?? 60,
		title: props.file.name,
	})

	return make.div({
		style: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
		}
	},[
		icon,
		make.div({
			style: {
				fontSize: '10px',
				maxWidth: `${props.size ?? 80}px`,
				textOverflow: 'ellipsis',
				overflow: 'hidden',
				whiteSpace: 'nowrap',
			}
		},props.file.name),
	])
}