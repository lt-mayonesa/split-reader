/**
 * Script to add click event listener to web page and split the page into iframes
 * depending on the modifiers used:
 * ctrl + shift + click: open link in new iframe splitting vertically
 * ctrl + alt + click: open link in new iframe splitting horizontally
 *
 * both splits should take into account the already open iframes
 * script should use css grid to split the page
 */

/**
 * @readonly
 * @typedef {string} DIRECTION
 * @enum {string}
 */
const DIRECTION = {
    vertical: 'vertical',
    horizontal: 'horizontal',

    /**
     * Returns the direction value from the event modifiers
     *
     * @param event
     * @returns {DIRECTION|undefined}
     */
    valueFromModifiers: (event) => {
        if (event.shiftKey) {
            return DIRECTION.vertical;
        } else if (event.altKey) {
            return DIRECTION.horizontal;
        }
    }
};

/**
 * @readonly
 * @typedef {string} PLACEMENT
 * @enum {string}
 */
const PLACEMENT = {
    start: 'start',
    end: 'end',
};

const Stylers = {
    __vertical_placement: {
        [PLACEMENT.start]: 'left',
        [PLACEMENT.end]: 'right',
    },
    __horizontal_placement: {
        [PLACEMENT.start]: 'top',
        [PLACEMENT.end]: 'bottom',
    },

    __shared: {
        border: 'none',
        boxSizing: 'border-box',
        position: 'fixed',
    },

    /**
     * Returns the style object for direction vertical and placement

     * @param {CSSStyleDeclaration} style
     * @param {PLACEMENT} placement
     * @returns {{[p: number]: string, border: string, borderLeft: string, top: string, width: string, boxSizing: string, position: string, height: string}}
     */
    [DIRECTION.vertical]: (style, placement) => ({
        ...Stylers.__shared,
        top: '0',
        width: '50%',
        height: '100%',
        borderLeft: '0.5px solid grey',
    [Stylers.__vertical_placement[placement]]: '0',
    }),

    /**
     * Returns the style object for direction horizontal and placement
     *
     * @param {CSSStyleDeclaration} style
     * @param {PLACEMENT} placement
     * @returns {{[p: number]: string, border: string, left: string, width: string, boxSizing: string, position: string, borderTop: string, height: string}}
     */
    [DIRECTION.horizontal]: (style, placement) => ({
        ...Stylers.__shared,
        left: '0',
        width: '100%',
        height: '50%',
        borderTop: '0.5px solid grey',
        [Stylers.__horizontal_placement[placement]]: '0',
    })

};

/**
 * Adds a time parameter to the url to force reload the iframe
 *
 * @param {URL} url
 * @returns {URL}
 */
function addForceReloadParam(url) {
    const time = new Date().getTime();
    url.searchParams.set('split_reader_force_reload', time.toString());
    return url;
}

/**
 * Creates an iframe for the given url and direction
 *
 * @param {URL} url
 * @param {DIRECTION} direction
 * @param {PLACEMENT} placement
 * @returns {HTMLIFrameElement}
 */
function createFrameFor(url, direction, placement) {
    const frame = document.createElement('iframe');
    for (const [key, value] of Object.entries(Stylers[direction](frame.style, placement))) {
        frame.style[key] = value;
    }
    document.body.appendChild(frame);
    frame.src = addForceReloadParam(url).href;
    return frame;
}

/**
 * Opens the given anchor in split mode
 *
 * @param {HTMLAnchorElement} anchor
 * @param {DIRECTION} direction
 */
function openInSplitMode(anchor, direction) {
    document.body.innerHTML = '';
    let currentUrl = new URL(window.location.href);
    currentUrl = withTextFragment(currentUrl, anchor.innerText);
    createFrameFor(currentUrl, direction, PLACEMENT.start);
    createFrameFor(new URL(anchor.href), direction, PLACEMENT.end);
}


/**
 *
 * @param {URL} url
 * @param {string} selection
 * @returns {URL}
 */
const withTextFragment = (url, selection) => {
    return new URL(`${url.href}${url.hash ? '' : '#'}:~:text=${encodeURIComponent(selection)}`);
};

/**
 * Handles the click event
 *
 * @param {MouseEvent} event
 */
function handleClick(event) {
    let anchor = event.target.closest('a');
    if (anchor !== null && event.ctrlKey) {
        let direction = DIRECTION.valueFromModifiers(event);
        if (direction) {
            event.preventDefault();
            openInSplitMode(anchor, direction);
        }
        document.body.style.overflow = 'hidden';
    }
}

document.addEventListener('click', handleClick);
document.querySelectorAll('a')
    .forEach(each => {
        each.addEventListener("click", handleClick);
    });
