// tippy('button', {
//     content(btn) {
//         let contactType = btn.dataset.contactType;
//             let contactValue = btn.dataset.contactValue;
//             return `<span>${contactType}: <a href="#"> ${contactValue}</a></span>`
//     },
//     allowHTML: true,
//     trigger: 'click',
//     hideOnClick: 'toggle'
// })

let block = document.querySelector('button');
let wrap = document.querySelector('.wrapper');
let container = document.querySelector('.container')

// console.log(getComputedStyle(block.parentElement).overflow)
// let scrolledElems = [];
// function getScrollingParent(el) {
//     if (!el) return
//     if (isScrolling(el)) {
//         scrolledElems.push(el)
//     }
//     return getScrollingParent(el.parentElement)
// }

// getScrollingParent(block)
// console.log(scrolledElems)

// function isScrolling(el) {
//     const { overflow, overflowX, overflowY } = getComputedStyle(el);
//     return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);

// }


function getScroll(el) {
    let scrolledElems = [];
    function getScrollingParent(el) {
        if (!el) return
        if (isScrolling(el)) {
            scrolledElems.push(el)
        }
        return getScrollingParent(el.parentElement)
    }

    getScrollingParent(el)

    function isScrolling(el) {
        const { overflow, overflowX, overflowY } = getComputedStyle(el);
        return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);

    }
    return scrolledElems
}

// console.log(getScroll(block))

function getScroll(el) {
    function getScrollingParent(el) {
        if (!el) return
        if (isScrolling(el)) {
            return el
        }
        return getScrollingParent(el.parentElement)
    }

    let scrolledElem = getScrollingParent(el)

    function isScrolling(el) {
        const { overflow, overflowX, overflowY } = getComputedStyle(el);
        return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);

    }
    return scrolledElem
}

console.log(getScroll(block))