class MoveBlock {
  constructor(breakpoints) {
    this.breakpoints = breakpoints;
    this.setMedia();
  }

  setMedia() {
    this.breakpoints.forEach(point => {
      const { solution } = point;
      let mediaQuery = window.matchMedia(`${solution}`);
      if (mediaQuery.matches) this.moveBlock(point);
      mediaQuery.addEventListener('change', (e) => {
        if (e.matches) this.moveBlock(point)
      })
    })
  }

  moveBlock(point) {
    const { targetEl, elToMove, insertMethod } = point;
    const elToMoveArr = elToMove.map(item => this.isArray(item) ? item : [item]);
    console.log(elToMoveArr)
    targetEl.forEach((el, i) => {
      const method = this.isString(insertMethod) ? insertMethod : insertMethod[i]
      this.checkMethod(method, el, elToMoveArr[i])
    })

  }

  checkMethod(method, target, elemToPaste) {
    switch (method) {
      case 'append':
        target.append(...elemToPaste);
        break;
      case 'prepend':
        target.prepend(...elemToPaste);
        break;
      case 'after':
        target.after(...elemToPaste);
        break;
      case 'before':
        target.before(...elemToPaste);
        break;
      default:
        target.replaceWith(...elemToPaste);
        break;

    }
  }

  isArray(value) {
    return Array.isArray(value)
  }
  isString(value) {
    return typeof value === "string"
  }
}

// Initialization, example

const logo = document.querySelector('.logo')
const submenu = document.querySelector('.submenu')
const menu = document.querySelector('.menu')
let variant = [logo, menu, submenu]
let variant1 = [logo, submenu, menu]
let variant2 = [menu, logo, submenu]


let block = new MoveBlock(
  [
    {
      solution: "(min-width: 1000px)",
      targetEl: [document.querySelector('.header__container')],
      elToMove: [variant],
      insertMethod: 'append'
    },
    {
      solution: "(min-width: 600px) and (max-width: 999px)",
      targetEl: [document.querySelector('.header__container')],
      elToMove:[ variant1],
      insertMethod: 'append'
    },
    {
      solution: "(max-width: 599px)",
      targetEl: [document.querySelector('.header__container')],
      elToMove: [variant2],
      insertMethod: 'append'
    },
    {
      solution: "(min-width: 599px)",
      targetEl: [document.querySelector('.menu')],
      elToMove: [document.querySelector('.menu__item:last-child')],
      insertMethod: 'append'
    },
    {
      solution: "(max-width: 600px)",
      targetEl: [document.querySelector('.submenu')],
      elToMove: [document.querySelector('.menu__item:last-child')],
      insertMethod: 'append'
    }
  ]
)