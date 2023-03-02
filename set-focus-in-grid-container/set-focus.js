function SetFocus(blockToSetFocus, options) {
  const core = {
    init() {
      const defaults = {
        isFirstOnPage: false,
        focusedPrev: undefined,
        focusedPost: document.querySelector("a, input:not([disabled]), button:not([disabled]), [tabindex]"),//если не указан в настройках, по умолчанию фокус перейдет к первому на странице элементу
      }
      this.options = Object.assign(defaults, options);
      this.isFirstOnPage = this.options.isFirstOnPage;
      this.container = this.isSelector(blockToSetFocus) ? document.querySelector(blockToSetFocus) : blockToSetFocus;
      this.prev = this.isSelector(this.options.focusedPrev) ? document.querySelector(this.options.focusedPrev) : this.options.focusedPrev
      this.post = this.isSelector(this.options.focusedPost) ? document.querySelector(this.options.focusedPost) : this.options.focusedPost;
      this.orderedChilds = this.container.children;
      this.focusedArr = [];
      this.firstArrEl = null;
      this.lastArrEl = null;
      this.manageTabNav();

    },
    //управление фокусом при ресайзе окна
    manageTabNav() {
      this.setTabNav()
      window.addEventListener('resize', this.throttle(this.setTabNav, 100).bind(this))
    },
    //настройка фокуса
    setTabNav() {
      this.getFocusedArr();

      document.addEventListener('keydown', e => {
        if (e.code !== 'Tab') return;
        if(this.isFirstOnPage) {
          this.container.addEventListener('focus', this.setFocus(e.shiftKey).bind(this), { once: true });
        }
        let currentFocused = document.activeElement;
        currentFocused.addEventListener('blur', this.setBlur(e.shiftKey).bind(this), { once: true });
      });
    },

    // обработчик события focus
    setFocus(isShift) {
      return function(e) {
        if (isShift && !this.prev) {
          return
        } else if (isShift && this.prev) {
          this.prev.focus();
        } else this.firstArrEl.focus()
      }
    },
    // обработчик события blur
    setBlur(isShift) {
      return function (e) {
        let currentFocused = e.target;
        let before = this.isFirstOnPage?this.container:this.prev;
        let after = this.post;

        if (!isShift && currentFocused === before) {
          this.firstArrEl.focus();
        } else if (isShift && currentFocused === after) {
          this.lastArrEl.focus();
        } else if (this.focusedArr.includes(currentFocused)) {
          let currentIndex = this.focusedArr.indexOf(currentFocused);
          isShift
            ? (currentFocused === this.firstArrEl ? before.focus(): this.focusedArr[currentIndex - 1].focus())
            : (currentFocused === this.lastArrEl ? after.focus() : this.focusedArr[currentIndex + 1].focus());
        }
      }
    },
    // получаем массив с фокусируемыми элементами в нужном порядке
    getFocusedArr() {
      this.focusedArr = [];
      const sortedChilds = this.sortChilds();
      sortedChilds.forEach(el => {
        this.focusedArr.push(...this.getFocusableElems(el))
      })
      //следующая строка проверяет если в массиве есть элементы с дисплей ноне, то их из массива убирает. это нужно потому, что интерактивные элементы спрятанные с помощью display:none попадают в массив хоть и не фокусируются и могут вызывать проблемы в работе компонента. особенно на моб разрешении
      this.focusedArr = Array.from(this.focusedArr).filter(el => getComputedStyle(el).display !== "none");
      this.firstArrEl = this.focusedArr[0];
      this.lastArrEl = this.focusedArr[this.focusedArr.length - 1];
      console.log(this.focusedArr)
      console.log(this.firstArrEl)
      console.log(this.lastArrEl)
    },
    //сортируем дочерние элементы грид контейнера
    sortChilds() {
      return [...this.orderedChilds].sort((a, b) => {
        a = getComputedStyle(a).order;
        b = getComputedStyle(b).order;
        if (a < b) return -1;
      })
    },
    //функция которая находит все фокусируемые элементы внутри элемента
    getFocusableElems(el) {
      let focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]';
      let elemsArray = [...el.querySelectorAll(focusableElementsString)];
      let result = elemsArray.filter(i => !i.hasAttribute('tabindex') || i.getAttribute('tabindex') >= 0);
      return result
    },
    //функция проверяет аргумент является строкой или элеменотом возвращает булево значение
    isSelector(arg) {
      return typeof arg === "string";
    },
    // фнукция throttle
    throttle(fn, throttleTime) {
      let isThrottled = false
      return function () {
        if (isThrottled) return
        fn.apply(this, arguments)
        isThrottled = true
        setTimeout(function () {
          isThrottled = false
        }, throttleTime)
      }
    }

  }
  core.init()
}

new SetFocus  ('ul', {
  isFirstOnPage: true,
  // focusedPrev: '#btn1',
  focusedPost: '.hidden'
})

/*
  Конструктор SetFocus настраивает фокус в блоке в котором элементы меняются местами с помощью css свойства order, например грид контейнер или флекс. важно устанавливать положение элементов внутри контейнера именно свойством order и для всех элементов, т.к. происходит проверка именно этого свойства.
    Инициализация: new SetFocus('blockToSetFocus', options);
    --blockToSetFocus = может быть как селектором грид/флекс контейрена, так и элементом,
    --options = это объект со следующими настройками {isFirstOnPage: true/false, focusedPrev: selectorOrElem, focusedPost: selectorOrElem};
    --isFirstOnPage = булевое значение, по умолчанию false. Если элементы грид-контейнера первые фокусируемые на странице то пишем true. При этом важно самому блоку установить tabindex='0', для корректной работы фокуса.
    --focusedPrev/focusedPost = это последний фокусируемый элемент до грид(флекс) контейнера/ первый фокусируемы после;
    Примечания:
    1. focusedPrev нужно обязательно указывать, если перед грид контейнером существует интерактивный элемент. Если его нет, то эту настройку можно упустить.
    2. Если настраиваемый контейнер последний на странице, либо после него нет интерактивных элементов, то для корректной работы конструктора необходимо добавить любой интерактивный элемент и спрятать его. Например: <a href="#!" class="hidden"></a>; класс .hidden {position: absolute; top: -100vh; transform: scale(0); opacity: 0; outline: none;}. Если этот дополнительный элемент указать в настройке focusedPost то далее фокус естественным образом перейдет на элементы управления браузера(при этом читалка прочитает его как поусто). Если его не указать, то фокус с последнего элемента контейнера переместится на первый интерактивный элемент на странице.
     3. Если в настраиваемом блоке есть фокусируемые элементы которые скрываются/появляются на разных разрешениях, то важно скрывать их с помощью display:none. Компонент при формировании массива фокусируемых элементов, ислючает те, которые имеют данное свойство. Без этой фильтрации на мобильных разрешениях компонент отключается (возможно на моб устройствах браузер дополнительно оптимизирует страницу, при этом элементы остаются видны в js)
*/