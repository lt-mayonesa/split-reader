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

// document.body.addEventListener('mouseenter', event => {
//     document.querySelector(`#wrapper_${window.frameElement?.id} .iframe-controls`)
//         ?.classList.add('show');
// });
//
// document.body.addEventListener('mouseleave', event => {
//     document.querySelector(`#wrapper_${window.frameElement?.id} .iframe-controls`)
//         ?.classList.remove('show');
// });