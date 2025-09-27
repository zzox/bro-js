import { names } from '../data/names'

const canvas = document.getElementById('main-canvas') as HTMLCanvasElement

const resizeCanvas = () => {
  const maxMulti = 20
  const w = canvas.width
  const h = canvas.height
  // overflow pixels
  const padding = 0
  // smallest width on 40 percent
  const availW = Math.min(canvas.parentElement!.getBoundingClientRect().width, document.body.getBoundingClientRect().width * .4)
  const availH = canvas.parentElement!.getBoundingClientRect().height
  const maxW = Math.floor(availW / (w - padding))
  const maxH = Math.floor(availH / (h - padding))
  const multi = Math.min(Math.min(maxW, maxH), maxMulti)

  canvas.style.width = `${multi * w}px`
  canvas.style.height = `${multi * h}px`
}

window.onresize = resizeCanvas
resizeCanvas()

const ctx = canvas!.getContext('2d') as CanvasRenderingContext2D

export { ctx }

// TODO: remove
ctx.font = '16px serif'
ctx.fillStyle = 'white'
ctx.fillText(`${names[Math.floor(Math.random() * names.length)]} BroOoOoOoOoOo`, 24, 24)
