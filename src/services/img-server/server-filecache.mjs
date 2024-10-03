import { decodeBase64 } from "../lib/base64.mjs";
import { thumbnailFile } from "../lib/image-util.mjs";
import { sleep } from "../lib/sleep.mjs";

let inputBuffer = '';

async function processLine (imgPathBase64) {
	const imgPath = decodeBase64(imgPathBase64);
	return await thumbnailFile(imgPath);
}


process.stdin.on('data', async (data) => {
	inputBuffer += data;

	while (1) {	
		const newline = inputBuffer.indexOf('\n');
		
		if (newline != -1) {
			const line = inputBuffer.substring(0, newline);
			inputBuffer = inputBuffer.substring(newline+1);
			
			const buf = await processLine(line);
			process.stdout.write(buf + '\n');
		}
		else {
			break;
		}		
	}
});
