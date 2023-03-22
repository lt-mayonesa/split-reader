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
    },

    inverse: (direction) => {
        switch (direction) {
            case DIRECTION.vertical:
                return DIRECTION.horizontal;
            case DIRECTION.horizontal:
                return DIRECTION.vertical;
            default:
                throw new Error(`Invalid direction: ${direction}`);
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

function randomId() {
    return Math.random().toString(36).substring(2, 9);
}

const createContainer = (dr, id = null) => {
    let c = document.createElement('div');
    c.id = id || randomId();
    c.className = `flex-container container-${dr}`;
    return c;
};

/**
 * Creates an iframe for the given url
 *
 * @param {URL} url
 * @returns {HTMLIFrameElement}
 */
function createFrameFor(url) {
    const frame = document.createElement('iframe');
    frame.id = `${randomId()}`;
    frame.src = addForceReloadParam(url).href;
    return frame;
}

function getOrCreateContainer(frameId, direction, initialFrame) {
    let container = document.getElementById('main_container');

    if (!container) {
        document.body.innerHTML = '';
        document.body.style.overflow = 'hidden';
        document.body.style.backgroundColor = '#ccc';

        container = createContainer(direction, 'main_container');
        let c = createContainer(DIRECTION.inverse(direction));
        c.appendChild(initialFrame);
        container.appendChild(c);
        document.body.appendChild(container);
    }
    return {
        addFrame: (url) => {
            let frameContainer = document.getElementById(frameId)?.parentElement || container;
            let newFrame = createFrameFor(url);
            let c = createContainer(DIRECTION.inverse(direction));
            c.appendChild(newFrame);
            if (frameContainer.parentElement.classList.contains(`container-${direction}`)) {
                frameContainer.parentElement.appendChild(c);
            } else {
                frameContainer.appendChild(c);
            }
        }
    };
}

/**
 * Opens the given anchor in split mode
 *
 * @param {HTMLAnchorElement} anchor
 * @param {DIRECTION} direction
 */
function openInSplitMode(anchor, direction) {
    let currentUrl = new URL(window.location.href);
    currentUrl = withTextFragment(currentUrl, anchor);

    let container = getOrCreateContainer(
        anchor.ownerDocument.defaultView.frameElement?.id,
        direction,
        createFrameFor(currentUrl)
    );
    container.addFrame(new URL(anchor.href));
}


/**
 *
 * @param {URL} url
 * @param {HTMLAnchorElement} anchor
 * @returns {URL}
 */
const withTextFragment = (url, anchor) => {
    //TODO: have text be the text of the parent element
    return new URL(`${url.href}${url.hash ? '' : '#'}:~:text=${encodeURIComponent(anchor.innerText)}`);
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
            event.stopPropagation();
            openInSplitMode(anchor, direction);
        }
    }
}

/**
 * Close iframe element if it has siblings, else close parent element
 *
 * @param {string} id
 */
function closeFrame(id) {
    let frame = document.getElementById(id);
    if (frame.parentElement.childElementCount === 1)
        frame.parentElement.remove();
    else
        frame.remove();
}