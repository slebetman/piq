import { thumbnailBuffer } from "../lib/image-util.mjs";

let inputBuffer = '';

async function processLine (imgPath) {
	const buf = await thumbnailBuffer(Buffer.from(imgPath,'base64').toString());
	process.stdout.write('data:image/webp;base64,' + buf.toString('base64') + '\n');
}


process.stdin.on('data', (data) => {
	inputBuffer += data;

	while (1) {	
		const newline = inputBuffer.indexOf('\n');
		
		if (newline != -1) {
			const line = inputBuffer.substring(0, newline);
			inputBuffer = inputBuffer.substring(newline+1);
			
			processLine(line);
		}
		else {
			break;
		}		
	}
});
