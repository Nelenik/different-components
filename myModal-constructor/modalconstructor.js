function ModalConstructor(triggerSelectorOrEl, userOptions) {
  this.core = {
    main() {
      let defaults = {
        autoOpen: false,
        isStatic: false,
        modalInner: null,
        enableTransition: true,
        animTime: null,
        easing: "ease",
        elemToFocus: null,
        // classes
        modalCloseBtnClass: null,
        modalOverlayClass: "modal-overlay",
        modalWrapperClass: "modal-wrapper",
        modalAnimationClass: "modalInitAnim",
        modalInAnimClass: "openAnim",
        modalOutAnimClass: "outAnim",
      };
      this.options = Object.assign(defaults, userOptions);
      this.isStatic = this.options.isStatic;
      this.animTime = this.options.animTime;
      const isString = typeof triggerSelectorOrEl === "string";
      this.triggerBtn = isString
        ? document.querySelector(triggerSelectorOrEl)
        : triggerSelectorOrEl;
      this.isOpen = false;
      this.modalEl;
      this.lastFocusedOutOfModal;
      this.focusableElems;

      this.handleDocumentClick = this.handleDocumentClick.bind(this);
      this.handleDocumentKeydown = this.handleDocumentKeydown.bind(this);
      document.addEventListener("click", this.handleDocumentClick);
      document.addEventListener("keydown", this.handleDocumentKeydown);
    },

    handleDocumentClick(event) {
      const {
        autoOpen,
        modalCloseBtnClass,
        modalOverlayClass,
        modalWrapperClass,
      } = this.options;
      if (autoOpen && event.target.closest("button") === this.triggerBtn) {
        this.openModal();
        this.manageScroll();
      }
      if (
        this.isOpen &&
        (event.target.closest(`.${modalCloseBtnClass}`) ||
          (!event.target.closest(`.${modalWrapperClass}`) &&
            event.target.matches(`.${modalOverlayClass}`)))
      ) {
        this.closeModal();
      }
    },

    handleDocumentKeydown(event) {
      if (this.isOpen && event.code == "Escape") this.closeModal();
    },

    removeHandlers() {
      document.removeEventListener("click", this.handleDocumentClick);
      document.removeEventListener("keydown", this.handleDocumentKeydown);
    },

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
    createModalOverlay() {
      const { modalOverlayClass, modalAnimationClass } = this.options;
      const overlay = this.createHtml({
        tagName: "div",
        classes: [modalOverlayClass, modalAnimationClass],
      });
      overlay.append(this.createModalWrapper());
      document.body.append(overlay);
      return overlay;
    },

    createModalWrapper() {
      const { modalInner, modalWrapperClass } = this.options;
      if (!modalInner) return;
      let isObject = typeof modalInner === "object";
      const wrapper = this.createHtml({
        tagName: "div",
        classes: [modalWrapperClass],
        attributes: { tabindex: "0" },
      });
      isObject ? wrapper.append(modalInner) : (wrapper.innerHTML = modalInner);
      return wrapper;
    },

    openModal() {
      const { modalInAnimClass } = this.options;
      if (this.isStatic) {
        this.modalEl = document.querySelector(
          `[data-modal="${this.triggerBtn.dataset.path}"]`
        );
      } else this.modalEl = this.createModalOverlay();

      this.isOpen = true;
      this.modalEl.dispatchEvent(
        new CustomEvent("modalOnOpen", {
          bubbles: true,
          cancelable: true,
          detail: { isOpen: this.isOpen },
        })
      );

      this.lastFocusedOutOfModal = document.activeElement;
      this.focusableElems = this.recieveFocusableElems(this.modalEl);

      setTimeout(() => {
        this.modalEl.classList.add(modalInAnimClass);
        this.setTransition();
      }, 0);

      setTimeout(() => {
        this.setFocus();
        this.catchFocus();
      }, this.animTime);
    },

    closeModal() {
      const { modalInAnimClass, modalOutAnimClass } = this.options;
      this.isOpen = false;
      this.modalEl.dispatchEvent(
        new CustomEvent("modalOnClose", {
          bubbles: true,
          cancelable: true,
          detail: { isOpen: this.isOpen },
        })
      );
      this.modalEl.classList.remove(modalInAnimClass);
      this.modalEl.classList.add(modalOutAnimClass);
      this.setFocus();
      this.manageScroll();
      this.removeHandlers();
      if (!this.isStatic)
        setTimeout(() => this.modalEl.remove(), this.animTime);
    },

    setTransition() {
      const { enableTransition, easing } = this.options;
      if (!enableTransition) return;
      this.modalEl.style.transition = `all ${this.animTime / 1000}s ${easing}`;
    },

    manageScroll() {
      let body = document.body;
      let scrollWidth = window.innerWidth - body.offsetWidth + "px";
      let fixedEl = document.querySelectorAll(".fixed-el");
      if (this.isOpen) {
        body.style.overflow = "hidden";
        body.style.paddingRight = scrollWidth;
        fixedEl.forEach((el) => {
          el.style.paddingRight = scrollWidth;
        });
      } else {
        body.style.overflow = "auto";
        body.style.paddingRight = "";
        fixedEl.forEach((el) => {
          el.style.paddingRight = "";
        });
      }
    },

    recieveFocusableElems(el) {
      let focusableElementsString =
        "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex], [contenteditable]";
      let elemsArray = [...el.querySelectorAll(focusableElementsString)];
      let result = elemsArray.filter(
        (i) =>
          !i.hasAttribute("tabindex") ||
          (i.hasAttribute("tabindex") && i.getAttribute("tabindex") >= 0)
      );
      result = result.length > 0 ? result : false;
      return result;
    },

    setFocus() {
      let { elemToFocus } = this.options;

      if (this.isOpen && elemToFocus) {
        let toFocus = this.modalEl.querySelector(elemToFocus);
        if (!toFocus) return;
        toFocus.focus();
      } else if (this.isOpen && this.focusableElems) {
        this.focusableElems[0].focus();
      } else this.lastFocusedOutOfModal.focus();
    },

    catchFocus() {
      let focArr = this.focusableElems;
      let firstFocused = focArr[0];
      let lastFocused = focArr[focArr.length - 1];
      this.modalEl.addEventListener(
        "keydown",
        function (e) {
          if (
            e.code == "Tab" &&
            e.shiftKey &&
            document.activeElement == firstFocused
          ) {
            e.preventDefault();
            lastFocused.focus();
          }
          if (e.code == "Tab" && document.activeElement == lastFocused) {
            e.preventDefault();
            firstFocused.focus();
          }
        }.bind(this)
      );
    },
  };
  this.updateInner = (inner) => {
    if (inner) {
      this.core.options.modalInner = inner;
    }
  };
  this.open = () => {
    this.core.openModal();
    this.core.manageScroll();
  };
  this.close = () => {
    this.core.closeModal();
  };
  this.core.main();
}

// window.ModalConstructor = ModalConstructor;
