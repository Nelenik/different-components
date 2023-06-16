// totalPages = обязательный параметр, инициализируем именем класса обертки или селектором
// defaults = {
//   totalPages, (обязательный параметр)
//   visibleAtLeft: 1, (количество кнопок слева от активной)
//   visibleAtRight: 1,(количество кнопок справа от активной)
//   maxCountOfVisible: 7, (при каком количестве всех страниц выводить сразу все кнопки)
//   enableDots: false, (нужны ли кнопки с многоточием)
//   enablePrevAndNext: true,(нужны ли кнопки prev и  next)
//   prevInnerHtml: '⭠',(содержимое кнопок в виде текста или html(img, svg))
//   nextInnerHtml: '⭢',
//   enableFirstAndLast: false,(нужны ли кнопки в начало и в конец)
//   firstInnerHtml: '⭰',
//   lastInnerHtml: '⭲',
//   hrefValue: './index.html', (значение для формирования ссылки)
//   controlsState: 'hide'/'disable',(прятать кнопки управления когда активная первая или последняя или делать их неактивными)
//   paginationClass: "pagination__btn",( класс кнопок навигации)
//   dotClass: "pagination__dot",(класс кнопок с "...")
//   ctrlsLeftWrapper: "pagination-ctrls-left",(класс обертки кнопок управления слева)
//   ctrlsRightWrapper: "pagination-ctrls-right",(класс обертки кнопок управления справа)
//   prevClass: "pagination__prev",
//   nextClass: "pagination__next",
//   startClass: "pagination__start",
//   endClass: "pagination__end",
//   currentClass: "current",(класс кнопки текущей страницы)
//   disableClass: "disable",(класс неактивной кнопки управления)
// }

function PaginatorButtons(selectorOrElem, userOptions) {
  const core = {
    main() {
      let defaults = {
        totalPages: null,
        visibleAtLeft: 1,
        visibleAtRight: 1,
        maxCountOfVisible: 7,
        enableDots: false,
        enablePrevAndNext: true,
        prevInnerHtml: '⭠',
        nextInnerHtml: '⭢',
        enableFirstAndLast: false,
        firstInnerHtml: '⭰',
        lastInnerHtml: '⭲',
        hrefValue: './index.html',
        controlsState: 'disable',
        paginationClass: "pagination__btn",
        dotClass: "pagination__dot",
        ctrlsLeftWrapper: "pagination-ctrls-left",
        ctrlsRightWrapper: "pagination-ctrls-right",
        prevClass: "pagination__prev",
        nextClass: "pagination__next",
        startClass: "pagination__start",
        endClass: "pagination__end",
        currentClass: "current",
        disableClass: "disable",
      };
      this.options = Object.assign(defaults, userOptions);
      const isString = (typeof selectorOrElem === 'string');
      this.container = isString ? document.querySelector(selectorOrElem) : selectorOrElem;
      this.currentPage = 1;
      this.renderBtns()
    },


    renderBtns() {
      let { enablePrevAndNext, enableFirstAndLast, currentClass, ctrlsLeftWrapper, ctrlsRightWrapper, prevClass, nextClass, startClass, endClass, prevInnerHtml, nextInnerHtml, firstInnerHtml, lastInnerHtml } = this.options;
      this.container.innerHTML = '';
      let btnsInnerObj = this.ratePagBtnsInner();
      // render pag btns
      btnsInnerObj.items.forEach(item => {
        if (item === '...') {
          this.container.append(this.createDotBtn())
        } else if (typeof item === 'number') {
          let btn = this.createPaginBtn(item);
          this.container.append(btn)
          if (+btn.dataset.page === this.currentPage) { btn.classList.add(currentClass); btn.focus() }
        }
      });
      // render controls
      const leftWrap = document.querySelector(`.${ctrlsLeftWrapper}`);
      const rightWrap = document.querySelector(`.${ctrlsRightWrapper}`);
      leftWrap.innerHTML = rightWrap.innerHTML = '';
      if (enablePrevAndNext) {
        let prev = this.createControlBtn(btnsInnerObj.prev, prevInnerHtml, prevClass);
        leftWrap.append(prev);
        let next = this.createControlBtn(btnsInnerObj.next, nextInnerHtml, nextClass);
        rightWrap.prepend(next);
      };
      if (enableFirstAndLast) {
        let first = this.createControlBtn(btnsInnerObj.first, firstInnerHtml, startClass);
        leftWrap.prepend(first);
        let last = this.createControlBtn(btnsInnerObj.end, lastInnerHtml, endClass);
        rightWrap.append(last);
      }
    },

    // настройка пагинации, возвращает массив с содержимым кнопок, прев, некст, енд, старт
    ratePagBtnsInner() {
      let { totalPages: pages, visibleAtLeft: lBtns, visibleAtRight: rBtns, maxCountOfVisible: maxBtns, enableDots: dots, enablePrevAndNext, enableFirstAndLast } = this.options;

      let current = this.currentPage;
      let items = [],//массив конечных элементов
        prev, next, first, end;

      if (enablePrevAndNext) {
        prev = current === 1 ? 1 : current - 1;
        next = current === pages ? pages : current + 1;;
      } else prev = next = null;

      if (enableFirstAndLast) {
        first = 1;
        end = pages;
      } else first = end = null;

      if (pages <= maxBtns) {
        for (let i = 1; i <= pages; i++) { items.push(i) }
      } else {
        let left = current - lBtns;
        let right = Math.min(current + rBtns, pages);

        if (dots) {
          items.push(1);
          left = left > 2 ? left : 2;
          for (let i = left; i <= right; i++) { items.push(i); };
          if (right < pages) { items.push(pages); };
          if (left - 1 > 1) { items.splice(1, 0, '...'); };
          if (right + 1 < pages) { items.splice(-1, 0, '...'); };
        } else {
          left = left > 1 ? left : 1;
          for (let i = left; i <= right; i++) { items.push(i); };
        }
      }

      return { items, prev, next, first, end }
    },
    // ф-я создания тегов
    createHtml(options) {
      const tag = document.createElement(options.tagName);
      if (options.classes) tag.classList.add(...options.classes);
      if (options.attributes) {
        for (let key in options.attributes) {
          tag.setAttribute(key, options.attributes[key]);
        }
      }
      if (options.text) tag.textContent = options.text;
      if (options.inner) tag.innerHTML = options.inner;
      return tag;
    },
    // создаем кнопку с "..."
    createDotBtn() {
      const { dotClass } = this.options;
      let dotBtn = this.createHtml({
        tagName: 'a',
        classes: [dotClass],
        text: '...',
      });
      return dotBtn
    },
    // кнопка пагинации
    createPaginBtn(pageNum) {
      const { paginationClass, hrefValue } = this.options;
      const paginBtn = this.createHtml({
        tagName: 'a',
        classes: [paginationClass],
        attributes: { 'href': pageNum > 1 ? `${hrefValue}?page=${pageNum}` : `${hrefValue}`, 'data-page': pageNum },
        text: pageNum,
      })
      paginBtn.addEventListener('click', this.paginBtnHandler.bind(this));
      return paginBtn;
    },
    // обработчик пагинации
    paginBtnHandler(e) {
      e.preventDefault();//временно
      const { currentClass } = this.options;
      let target = e.currentTarget;
      this.currentPage = +target.dataset.page;
      document.querySelector(`.${currentClass}`).classList.remove(currentClass);
      this.renderBtns();
    },
    // кнопки управления
    createControlBtn(pageNum, innerValue, controlClass) {
      let { hrefValue, totalPages } = this.options;

      const cntrlBtn = this.createHtml({
        tagName: 'a',
        classes: [controlClass],
        attributes: { 'href': pageNum > 1 ? `${hrefValue}?page=${pageNum}` : `${hrefValue}`, 'data-id': pageNum },
        inner: innerValue,
      });

      if ((pageNum < 1 || pageNum > totalPages)) {
        this.disableHideCntrls(cntrlBtn)
      }
      if (this.currentPage === +cntrlBtn.dataset.id) {
        this.disableHideCntrls(cntrlBtn)
      }
      cntrlBtn.addEventListener('click', this.controlBtnHandler.bind(this));
      return cntrlBtn
    },
    // функция деактивации/удаления кнопок управления в крайних положениях
    disableHideCntrls(cntrlBtn) {
      let { controlsState, disableClass } = this.options
      if (controlsState === 'disable') cntrlBtn.classList.add(disableClass);
      else if (controlsState === 'hide') cntrlBtn.style.display = 'none';
      else return;
    },
    // обработчик кнопок управления
    controlBtnHandler(e) {
      e.preventDefault();//временно
      let target = e.currentTarget;
      this.currentPage = +target.dataset.id;
      this.renderBtns();
    }
  };
  this.update() = () => {
    core.renderBtns()
  }
  core.main()
}


let pag = new PaginatorButtons('.pagination', {
  totalPages: 15,
  visibleAtLeft: 2,
  visibleAtRight: 2,
  controlsState: 'disable',
  // enablePrevAndNext: false,
  enableFirstAndLast: true,
  enableDots: true,

})


