// @ts-ignore
export const $q = (query:string):HTMLElement => document.querySelector(query)
// @ts-ignore
export const $id = (id:string):HTMLElement => document.getElementById(id)
export const $make = (type:string):HTMLElement => document.createElement(type)

// makes a span string of a color class
export const $span = (text:string, color:string):string =>
  `<span class="${color}">${text}</span>`

export const setImage = (tile:number) => {
  const scale = 2
  const imgWidth = 384
  const sx = tile * 12 % imgWidth
  const sy = Math.floor(tile * 12 / imgWidth) * 12
  $q('.ssimg').style.backgroundPosition = `-${sx * scale}px -${sy * scale}px`
}
