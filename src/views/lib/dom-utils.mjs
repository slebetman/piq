let eCache = {};

/**
 * Creates HTML element
 * 
 * @param {string} type 
 * @param {Record<string,any>} prop 
 * @param {HTMLElement[]|string} children 
 * @returns HTML element
 */
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
				if (c) e.appendChild(c);
			}
		}
	}

	return e;
}

/**
 * @param {Record<string,any>} prop 
 * @param {HTMLElement[]|string} children 
 * @returns Div element
 */
make.div = (prop, children) => make('div', prop, children);

/**
 * @param {Record<string,any>} prop 
 * @param {HTMLElement[]|string} children 
 * @returns Span element
 */
make.span = (prop, children) => make('span', prop, children);

/**
 * @param {Record<string,any>} prop 
 * @param {HTMLElement[]|string} children 
 * @returns Button element
 */
make.button = (prop, children) => make('button', prop, children);

/**
 * @param {Record<string,any>} prop 
 * @returns Img element
 */
make.img = (prop) => make('img', prop);

/**
 * Adds child element to parent replacing any old content
 * 
 * @param {HTMLElement} parent 
 * @param {HTMLElement} child 
 */
export function render (parent, child) {
	for (const e of Array.from(parent.childNodes)) {
		parent.removeChild(e);
	}

	parent.appendChild(child);
}

/**
 * Get HTML element
 * 
 * @param {string} id 
 * @returns HTML element
 */
export function get (id) {
	if (!eCache[id]) {
		eCache[id] = document.getElementById(id);
	}
	return eCache[id];
}

/**
 * Gets and sets CSS variables
 * 
 * @param {string} name 
 * @param {string} value 
 * @returns string
 */
export function cssVar (name, value) {
	if (value) {
		return document.documentElement.style.setProperty(name, value);
	}
	else {
		return document.documentElement.style.getPropertyValue(name);
	}
}
