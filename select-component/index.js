const { el, mount, setChildren } = redom;
const toSort = [
  {
    "account": "74213041477477406320783754",
    "balance": 3821748.23,
    "mine": true,
    "transactions": [
      {
        "amount": 903.66,
        "date": "2023-05-25T09:20:13.796Z",
        "from": "11003535115258658052661020",
        "to": "74213041477477406320783754"
      }
    ]
  },
  {
    "account": "",
    "mine": true,
    "balance": 0,
    "transactions": []
  },
  {
    "account": "18127451883258043423582265",
    "mine": true,
    "balance": 3000,
    "transactions": [
      {
        "amount": 903.66,
        "date": "2023-03-13T09:20:13.796Z",
        "from": "11003535115258658052661020",
        "to": "74213041477477406320783754"
      }
    ]
  },
  {
    "account": "67543271451428046863781030",
    "mine": true,
    "balance": 0,
    "transactions": [
      {
        "amount": 903.66,
        "date": "2jklkllk",
        "from": "11003535115258658052661020",
        "to": "74213041477477406320783754"
      }
    ]
  },
  {
    "account": "26145614144538700408440222",
    "mine": true,
    "balance": 0,
    "transactions": []
  },
  {
    "account": "52548303264767428386450852",
    "mine": true,
    "balance": 0,
    "transactions": []
  }
]

/*
Простой селект, единичный выбор, поиск, автодополнение, построен на базе группы радиокнопок (нужна именно группа с одинаковым name, для правильной навигации).
Все доступные настройки для каждой опции указываем в массиве selectContent.Можно указывать изначально выбранный элемент указав true в свойстве selected, также в свойстве uniqueModificator можно указать уникальный для каждого айтема модификатор который будет добавлен в качестве дополнительного класса. Например: uniqueModificator: 'green' -> к select__item добавится класс select__item--green.

Инициализация:
const mySelect = new Select(options);

Опции:
--options: {
  selectContent: [
  { text: 'По номеру', value: 'account', name: 'sort', selected: false, uniqueModificator: '' },
  { text: 'По балансу', value: 'balance', name: 'sort', selected: false, uniqueModificator: '' },
  { text: 'По последней транзакции', value: 'transactions.0.date', name: 'sort', selected: true, uniqueModificator: '' },
];
  onSelect: (instance, value)=>{},(получает экземпляр и значение селекта)
  onOpen: (instance)=>{},
  onClose: (instance)=>{},
  onInput: (instance, inputValue)=>{},(работает с triggerType: 'text', при вводе в инпут, получает экземпляр и значение инпута),
  onValueChange: (instance, inputValue)=>{} (срабатывает при изменении значения селекта)
  additionalClass: 'some-class',(доп. класс добавляется к обертке селекта, полезно при стилизации разных селектов)
  placeholderText: 'some-text',(название списка),
  toChangePlaceholder: true(def), (нужно ли изменять плейсхолдер при выборе)
  triggerType: 'button'(def), (тип дропдауна, если нужно текстовое поле с автодополнением нужно указать 'text')
}
--методы:
mySelect.appendAt(target) - target -это элемент в который вставляем селект, в конец
mySelect.prependAt(target)- target -это элемент в который вставляем селект в начало
mySelect.reset() - сбрасываем выбраныне значения полностью, даже если были изначально выбранные,
mySelect.changeValue(newValue) - позволяет изменять на лету значение селекта. в newValue передается строка

--доступные свойства
mySelect.selectValue - получить значение селекта/инпута
mySelect.isOpen = true/false - открывает закрвает дропдаун
mySelect.selectContent = массив со значениями радиокнопок: { text: 'По номеру', value: 'account', name: 'sort' }, можно передать его позже

--зависим от библиотеки redom
--нужно быть осторожным с полем 'name' для других элементов формы, чтобы не было конфликта, также при использовании FormData полученный объект нужно будет отредактировать вручную, т.к. радиокнопка туда попадет.
--при использовании внутри формы, чтобы при выборе enter-ом не отправилась форма, в обработчике в самом начале пишем: form.addEventListener('submit',(e)=>{
  e.preventDefault();
  if (document.activeElement == e.target.{tirgger name atrr}) return;

  ---далее нужный код---
})
*/

export class Select {
	constructor(options) {
		const {
			selectContent,
			onSelect = () => {},
			onOpen = () => {},
			onClose = () => {},
			onInput = () => {},
			onValueChange = () => {},
			additionalClass = '',
			placeholderText = '',
			toChangePlaceholder = true,
			triggerType = 'button',
		} = options;

		this.onSelect = onSelect;
		this.onOpen = onOpen;
		this.onClose = onClose;
		this.onInput = onInput;
		this.onValueChange = onValueChange;
		this.additionalClass = additionalClass;
		this.placeholderText = placeholderText;
		this.toChangePlaceholder = toChangePlaceholder;
		this.triggerType = triggerType;

		this.isSelected = null;
		this.selectValue = '';
		this.prevActive = null;

		// создаем элементы селекта
		this.select = el(`div.select.${this.additionalClass}`);
		// триггер кнопка
		this.selectTrigger = el(
			'button.btn-reset.select__btn',
			{
				type: 'button',
				'aria-label': 'Открыть выпадающий список',
				name: 'selectTriggerBtn',
			},
			this.placeholderText
		);
		// триггер текстовый инпут для автозаполнения
		this.autocompleteInput = el('input.select__autocomplete', {
			type: 'text',
			placeholder: this.placeholderText,
			name: 'selectAutocomplete',
			value: '',
		});

		this.dropdown = el('div.select__dropdown');
		this.selectContent = selectContent;
		setChildren(this.select, [
			this.isSelect() ? this.selectTrigger : this.autocompleteInput,
			this.dropdown,
		]);
		this.isOpen = false;

		this.autocomplHandlers();
		this.selectTriggerHandlers();
		this.docHandlers();
	}

	set selectContent(value) {
		this.dropdown.innerHTML = '';
		this._selectContent = value;
		this.radioWrap = value?.map((item) => {
      console.log(item.selected)
			const radioBtn = el('input.select__def-radio', {
				type: 'radio',
				value: item.value,
				name: item.name,
				checked: item.selected || false,
			});
//       если есть модификатор переданный прописываем его если нет то пустую строку
      let labelModificator = item.itemModificator? `select__item--${item.itemModificator}`: '';
			const radioLabel = el(`label.select__item.${labelModificator}`);
			setChildren(radioLabel, [
				radioBtn,
				el('span.select__item-text', item.text),
			]);
			// если радиокнопка изначально выбрана
			this.setSelected(radioBtn, item.text);
			// обработчики
			this.radioHandlers(radioBtn);
			return radioLabel;
		});
    console.log(this.radioWrap)
		setChildren(this.dropdown, this.radioWrap);
		this.radioBtns = [...this.dropdown.querySelectorAll('input[type="radio"]')];
    
	}

	get selectContent() {
		return this._selectContent;
	}

	set isOpen(value) {
		this._isOpen = value;
		value ? this.openDropdown() : this.closeDropdown();
	}

	get isOpen() {
		return this._isOpen;
	}

	set selectValue(value) {
		this._selectValue = value;
		if (!value) return;
		this.onValueChange(this, value);
	}

	get selectValue() {
		return this._selectValue;
	}

	// проверяем тип select vs autocomplete
	isSelect() {
		if (this.triggerType === 'button') {
			return true;
		} else if (this.triggerType === 'text') {
			return false;
		} else {
			throw new Error('The triggerType setting should be "button" or "text"');
		}
	}
	// настраиваем выбранный элементв и значение кастомного селекта
	setSelected(radioBtn, itemText) {
		if (radioBtn.checked) {
			this.isSelected = radioBtn;
			this.selectValue = this.isSelected.value;
//      добавляем класс с модификатором --selected лейблу выбранной радиокнопки
      if(this.radioWrap) this.radioWrap.forEach((item)=>item.classList.remove('select__item--selected'))
      this.isSelected.closest('.select__item').classList.add('select__item--selected');

			if (this.toChangePlaceholder) {
				if (this.isSelect()) {
					this.selectTrigger.textContent = itemText;
					this.selectTrigger.dataset.value = this.selectValue;
					this.select.classList.add('select--selected');
				} else {
					this.autocompleteInput.value = itemText;
				}
			}
			this.onSelect(this, this.selectValue);
		}
	}
	//функции с обработчиками по элементам
	radioHandlers(radioBtn) {
		radioBtn.addEventListener('click', (e) => {
			if (e.clientX && e.clientY) {
				this.isOpen = false;
			}
		});

		radioBtn.addEventListener('keypress', (e) => {
			if (e.key === 'Enter' || e.key === 'Return') {
				this.isOpen = false;
			}
		});

		radioBtn.addEventListener('blur', (e) => {
			this.prevActive = e.target;
		});
	}

	selectTriggerHandlers() {
		this.selectTrigger.addEventListener('click', () => {
			this.isOpen = !this.isOpen;
		});
		this.selectTrigger.addEventListener(
			'keydown',
			this.btnKeydownHandler.bind(this)
		);
	}
	autocomplHandlers() {
		this.autocompleteInput.addEventListener('input', (e) => {
			this.isSelected = null;
			this.prevActive = null;
			this.selectValue = e.currentTarget.value;
			this.onInput(this, this.selectValue);
		});
		this.autocompleteInput.addEventListener(
			'keydown',
			this.btnKeydownHandler.bind(this)
		);
	}

	docHandlers() {
		document.addEventListener('keydown', this.docKeydownHandler.bind(this));
		document.addEventListener('click', (e) => {
			if (
				(!e.target.closest('.select') ||
					e.target.closest('.select') !== this.select) &&
				this.isOpen
			)
				this.isOpen = false;
		});
	}

	btnKeydownHandler(e) {
		if (e.code === 'ArrowDown') {
			e.preventDefault();
			if (!this.isOpen) {
				if (this.isSelect()) {
					this.isOpen = true;
				} else return;
			} else if (this.isSelected) {
				this.isSelected.focus();
			} else {
				const firstRadio = this.radioBtns[0];
				firstRadio.focus();
				firstRadio.click();
			}
		}
	}

	docKeydownHandler(e) {
		if (this.isOpen) {
			if (e.code === 'Tab') {
				e.preventDefault();
				this.isOpen = false;
			}
			if (e.code === 'Escape') {
				this.isOpen = false;
			}
		}
	}

	openDropdown() {
		this.onOpen(this);
		this.dropdown.classList.add('select__dropdown--js-shown');
		this.select.classList.add('select--active');
		if (this.isSelect()) {
			this.selectTrigger.setAttribute('aria-expanded', true);
		} else {
			this.autocompleteInput.setAttribute('aria-expanded', true);
		}
	}

	closeDropdown() {
		this.onClose(this);
		if (this.isSelect()) {
			this.selectTrigger.focus();
			this.selectTrigger.setAttribute('aria-expanded', false);
		} else {
			this.autocompleteInput.focus();
			this.autocompleteInput.setAttribute('aria-expanded', false);
		}
		this.dropdown.classList.remove('select__dropdown--js-shown');
		this.select.classList.remove('select--active');
		if (this.prevActive) {
			this.setSelected(
				this.prevActive,
				this.prevActive.nextElementSibling.textContent
			);
		}
	}

	appendAt(target) {
		target.append(this.select);
	}
	prependAt(target) {
		target.prepend(this.select);
	}
	reset() {
		this.selectValue = '';
		// this.isSelected.checked = false;
		this.prevActive = null;
    this.isSelected.closest('.select__item').classList.remove('select__item--selected');
		this.isSelected = null;
		if (this.isSelect()) {
			this.selectTrigger.textContent = this.placeholderText;
			this.select.classList.remove('select--selected');
		} else {
			this.autocompleteInput.value = '';
		}
	}
	changeValue(newValue) {
		const targetBtn = this.radioBtns.find((radio) => radio.value === newValue);
		targetBtn.checked = true;
		this.setSelected(targetBtn, targetBtn.nextElementSibling.textContent);
	}
}

/*************************************************************************** */

// EXAMPLES

const selectContent = [
  { text: 'По номеру', value: 'account', name: 'sort' },
  { text: 'По балансу', value: 'balance', name: 'sort' },
  { text: 'По последней транзакции', value: 'transactions.0.date', name: 'sort'},
];

// инициализация, при изменении значения происходит сортировка массива
const select = new Select(
  {
    onSelect: (inst, itemValue) => {
      toSort.sort(sortBy(itemValue))
      console.log(toSort)
    },
		selectContent: selectContent,
    additionalClass: 'sorter',
    placeholderText: 'Сортировка',
    toChangePlaceholder: true,
    triggerType: 'button'
  }
);

select.prependAt(document.querySelector('div'))


// функция сортировки
function sortBy(prop) {
  const props = prop.split('.')
  return (a, b) => {
    let aValue = a;
    let bValue = b;
    for (let item of props) {
      aValue = aValue ? aValue[item] : undefined;
      bValue = bValue ? bValue[item] : undefined;
    }
    if (typeof aValue === 'undefined' && typeof bValue === 'undefined') {
      return 0;
    } else if (typeof aValue === 'undefined') {
      return 1
    } else if (typeof bValue === 'undefined') {
      return -1
    } else if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (!isNaN(Date.parse(aValue)) && !isNaN(Date.parse(bValue))) {
        return Date.parse(bValue) - Date.parse(aValue)
      }
      return aValue.localeCompare(bValue)
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue
    }

  }
}