function MoveBlock(options) {
    const core = {
      init() {
        this.block = this.isString(options.singleBlock) ? document.querySelector(options.singleBlock) : options.singleBlock;
        this.breakpoints = options.breakpoints;
        this.mediaQuery;
        this.setMedia()
      },
      setMedia() {
        this.breakpoints.forEach(point => {
          const { solution } = point;
          let mediaQuery = window.matchMedia(`${solution}`);
          if(mediaQuery.matches) this.checkMethod(point)
          mediaQuery.addEventListener('change', function(e) {
            if(e.matches) this.checkMethod(point)
          }.bind(this))
        })
      },
      checkMethod(point) {
        const { method, target, elems, clearTarget } = point;
        let elemToPaste = elems ? elems : [this.block] 
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
      },
      isString(arg) {
        return typeof arg === "string";
      },
    }
    core.init()
  }


const logo = document.querySelector('.logo')
const submenu = document.querySelector('.submenu')
const menu = document.querySelector('.menu')
let variant = [logo, menu,submenu]
let variant1 = [logo, submenu, menu]
let variant2= [menu, logo, submenu]


new MoveBlock({
  breakpoints: [
    {
      solution: "(min-width: 1000px)",
      target: document.querySelector('.header__container'),
      elems: variant,
      method: 'append'
    },
    {
      solution: "(min-width: 600px) and (max-width: 999px)",
      target: document.querySelector('.header__container'),
      elems: variant1,
      method: 'append'
    },
    {
      solution: "(max-width: 599px)",
      target: document.querySelector('.header__container'),
      elems: variant2,
      method: 'append'
    }
  ]
})

// new MoveBlock({
//   singleBlock: '.logo',
//   breakpoints: [
//     {
//       solution: "(min-width: 1000px)",
//       target: document.querySelector('.menu'),
//       method: 'before'
//     },
//     {
//       solution: "(min-width: 600px) and (max-width: 999px)",
//       target: document.querySelector('.menu'),
//       method: 'after'
//     },
//     {
//       solution: "(max-width: 599px)",
//       target: document.querySelector('.submenu'),
//       method: 'after'
//     }
//   ]
// })