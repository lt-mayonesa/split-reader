function frameClick(event) {
    window.parent.handleClick(event);
}

document.addEventListener('click', frameClick);
document.querySelectorAll('a')
    .forEach(each => {
        each.addEventListener("click", frameClick);
    });

document.addEventListener('keydown', event => {
    if (event.ctrlKey && event.key === 'x') {
        window.parent.closeFrame(window.frameElement.id);
    }
});

const wrapper = window.parent.document.querySelector(`#wrapper_${window.frameElement?.id} .iframe-controls`);
let timeout = null;
document.body.addEventListener('mouseenter', _ => {
    wrapper?.classList.add('show');
    timeout = setTimeout(() => {
        wrapper?.classList.remove('show');
    }, 3000);
});

document.body.addEventListener('mousemove', _ => {
    wrapper?.classList.add('show');

    if (timeout)
        window.clearTimeout(timeout);
    timeout = setTimeout(() => {
        wrapper?.classList.remove('show');
    }, 3000);
});

document.body.addEventListener('mouseleave', _ => {
    wrapper?.classList.remove('show');
});