import { make } from "../lib/dom-utils.mjs";
import { fileContainer } from "./lib/file.mjs";

export function fileList (props) {
	const children = [];

	if (props.files?.length) {
		const regularFiles = [];
		const directories = [];

		for (const f of props.files) {
			if (! f.name.startsWith('.')) {
				const container = fileContainer({ file: f });

				if (f.isDirectory) directories.push(container);
				else regularFiles.push(container);
			}
		}

		children.push(...directories, ...regularFiles);
	}

	return make.div(
		{
			id: 'files',
		},
		children
	);
}