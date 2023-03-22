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
            frames.openInSplitMode(anchor, direction);
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
    let container = frames.searchUpFor(frame, 'flex-container');
    if (container.childElementCount === 1)
        container.remove();
    else
        frame.remove();
}


const frames = {
    /**
     * Opens the given anchor in split mode
     *
     * @param {HTMLAnchorElement} anchor
     * @param {DIRECTION} direction
     */
    openInSplitMode(anchor, direction) {
        let currentUrl = new URL(window.location.href);
        currentUrl = currentUrl.withTextFragmentFrom(anchor);

        frames.getOrCreateContainer(
            direction,
            frames.createFrameFor(currentUrl)
        ).addFrame(
            anchor.ownerDocument.defaultView.frameElement?.id,
            new URL(anchor.href)
        );
    },

    createContainer({direction, id = null, child = null}) {
        let c = document.createElement('div');
        c.id = id || randomId();
        c.className = `flex-container container-${direction}`;
        if (child) {
            c.appendChild(child);
        }
        return c;
    },

    /**
     * Creates an iframe for the given url
     *
     * @param {URL} url
     * @returns {HTMLDivElement}
     */
    createFrameFor(url) {
        const id = randomId();
        const wrapper = document.createElement('div');
        wrapper.id = `wrapper_${id}`;
        wrapper.className = 'iframe-wrapper';
        wrapper.innerHTML = `<div class="iframe-controls">
            <button class="btn-close"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgOTYgOTYwIDk2MCIgd2lkdGg9IjQ4Ij48cGF0aCBkPSJtMjQ5IDg0OS00Mi00MiAyMzEtMjMxLTIzMS0yMzEgNDItNDIgMjMxIDIzMSAyMzEtMjMxIDQyIDQyLTIzMSAyMzEgMjMxIDIzMS00MiA0Mi0yMzEtMjMxLTIzMSAyMzFaIi8+PC9zdmc+"/></button>
            <button class="btn-expand"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgOTYgOTYwIDk2MCIgd2lkdGg9IjQ4Ij48cGF0aCBkPSJNMjgxIDczNiAxMjEgNTc2bDE2MC0xNjAgNDMgNDMtODggODdoNDg5bC04Ny04OCA0Mi00MiAxNjAgMTYwLTE2MCAxNjAtNDItNDIgODctODgtNDg5IDEgODcgODctNDIgNDJaIi8+PC9zdmc+" /></button> 
            <button class="btn-colapse"><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgOTYgOTYwIDk2MCIgd2lkdGg9IjQ4Ij48cGF0aCBkPSJNMTIwIDkzNlYyMTZoNjB2NzIwaC02MFptMTY1LTMzMHYtNjBoNjB2NjBoLTYwWm0xNjUgMHYtNjBoNjB2NjBoLTYwWm0xNjUgMHYtNjBoNjB2NjBoLTYwWm0xNjUgMzMwVjIxNmg2MHY3MjBoLTYwWiIvPjwvc3ZnPg==" /></button> 
        </div>`;
        wrapper.querySelectorAll('button')
            .forEach((button, index) => {
                button.addEventListener('click', (event) => {
                    event.stopPropagation();
                    switch (button.className) {
                        case 'btn-close':
                            closeFrame(id);
                            break;
                        case 'btn-expand':
                            wrapper.parentElement.style.flexGrow = (Number(wrapper.parentElement.style.flexGrow || 1) + .5) + "";
                            break;
                        case 'btn-colapse':
                            wrapper.parentElement.style.flexGrow = (Number(wrapper.parentElement.style.flexGrow || 1) - .5) + "";
                            break;
                    }
                });
            });

        const frame = document.createElement('iframe');
        frame.id = id;
        frame.src = url.addForceReloadParam().href;
        wrapper.appendChild(frame);
        return wrapper;
    },

    getOrCreateContainer(direction, initialFrame) {
        let container = document.getElementById('main_container');

        if (!container) {
            document.body.innerHTML = '';
            document.body.style.overflow = 'hidden';
            document.body.style.backgroundColor = '#ccc';

            container = frames.createContainer({
                direction: direction,
                id: 'main_container',
                child: frames.createContainer({
                    direction: DIRECTION.inverse(direction),
                    child: initialFrame
                })
            });

            document.body.appendChild(container);
        }
        return {
            addFrame: (frameId, url) => {
                let frameContainer = frames.searchUpFor(
                    document.getElementById(frameId), 'flex-container') || container;
                let c = frames.createContainer({
                    direction: DIRECTION.inverse(direction),
                    child: frames.createFrameFor(url)
                });
                if (frameContainer.parentElement.classList.contains(`container-${direction}`)) {
                    frameContainer.parentElement.appendChild(c);
                } else {
                    frameContainer.appendChild(c);
                }
            }
        };
    },

    searchUpFor(element, className) {
        if (!element) return null;

        let target = element.parentElement;
        while (target && !target.classList.contains(className)) {
            target = target.parentElement;
        }
        return target;
    }
};


/**
 * Adds a time parameter to the url to force reload the iframe
 *
 * @returns {URL}
 */
URL.prototype.addForceReloadParam = function () {
    const time = new Date().getTime();
    this.searchParams.set('split_reader_force_reload', time.toString());
    return this;
};

/**
 *
 * @param {HTMLAnchorElement} anchor
 * @returns {URL}
 */
URL.prototype.withTextFragmentFrom = function (anchor) {
    //TODO: have text be the text of the parent element
    return new URL(`${this.href}${this.hash ? '' : '#'}:~:text=${encodeURIComponent(anchor.innerText)}`);
};


const randomId = () => {
    return Math.random().toString(36).substring(2, 9);
};

