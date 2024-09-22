let eCache = {};

export function make (type, prop, children) {
    let e = document.createElement(type);

    if (prop) {
        for (let p in prop) {
            if (p === 'style') {
                let propStyle = prop[p];
                for (let s in propStyle) {
                    e.style[s] = propStyle[s];
                }
            }
            else {
                e[p] = prop[p];
            }
        }
    }

    if (children) {
        if (typeof children === 'string') {
            e.innerHTML = children;
        }
        else {
            for (let c of children) {
                e.appendChild(c);
            }
        }
    }

    return e;
}

make.div = (prop, children) => make('div', prop, children);

export function get (id) {
	if (!eCache[id]) {
		eCache[id] = document.getElementById(id);
	}
	return eCache[id];
}
