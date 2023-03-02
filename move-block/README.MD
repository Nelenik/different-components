# MoveBlock Constructor

Конструктор предназначенн для переноса одного или группы элементов в новое место на разных медиазапросах. Для реализации этой задачи используются методы `matchMedia()`, а также методы вставки элементов (`append()`, `prepend()`, `after()`, `before()`, `replaceWith()`)

## Инициализация:

`new MoveBlock(options)`

Options - это объект с настройками
 ```
{
  <!--селектор или элемент, указывается если нужно перенести только одни элемент-->
  singleBlock: '.selector',
  <!-- массив объектов, каждый объект это 1 брекпойнт-->
  breakpoints : [
    {
      <!-- указываем разрешение, для промежуточных нужно указывать и min-width и max-width -->
      solution: "(min-width:1000px)",
      <!--елемент куда/рядом с которым перемещаем блок-->
      target: document.querySelector('.elem'),
      <!--массив элементов которые нужно вставить разом в одно место-->
      elems: [],  
      <!-- строка, название метода вставки(before, after, append, prepend, replaceWith) -->
      method: 'before'
    }
  ]
  
}
```
#### Пример переноса одного элемента:
```
  new MoveBlock({
    singleBlock: '.logo',
    breakpoints: [
      {
        solution: "(min-width: 1000px)",
        target: document.querySelector('.menu'),
        method: 'before'
      },
      {
        solution: "(min-width: 600px) and (max-width: 999px)",
        target: document.querySelector('.menu'),
        method: 'after'
      },
      {
        solution: "(max-width: 599px)",
        target: document.querySelector('.submenu'),
        method: 'after'
      }
    ]
 })
```
#### Пример переноса группы элементов
В примере создаются несколько вариантов расположения элементов в хедере которые затем используются в настройке
```
<!-- сохраняем ссылки на элементы -->
const logo = document.querySelector('.logo')
const submenu = document.querySelector('.submenu')
const menu = document.querySelector('.menu')
<!-- создаем нужную нам комбинацию этих элементов -->
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
```