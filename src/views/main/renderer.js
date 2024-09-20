const out = document.querySelector('#out');

async function main () {
	out.textContent = JSON.stringify(await api.getConfig(), null, 4);
}

main();