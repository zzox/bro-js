// @ts-ignore
export const $q = (query:string):HTMLElement => document.querySelector(query)
// @ts-ignore
export const $id = (id:string):HTMLElement => document.getElementById(id)
export const $make = (type:string):HTMLElement => document.createElement(type)

// makes a span string of a color class
export const $span = (text:string, color:string):string =>
  `<span class="${color}">${text}</span>`
