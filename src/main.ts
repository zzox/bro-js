import { names } from './data/names'
import { addLog } from './ui/logs'
import { Actor } from './world/actor'
import { forEachGI, makeGrid, TileType } from './world/grid'
import { Room } from './world/room'

console.log('bro')
// move to new file? or just new branch
const canvas = document.getElementById('main-canvas') as HTMLCanvasElement

const resizeCanvas = () => {
  const maxMulti = 20
  const w = canvas.width
  const h = canvas.height
  // overflow pixels
  const padding = 0
  const availW = canvas.parentElement!.getBoundingClientRect().width
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

ctx.fillStyle = '#26201d'
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.font = '16px serif'
ctx.fillStyle = 'white'
ctx.fillText(`${names[Math.floor(Math.random() * names.length)]} BroOoOoOoOoOo`, 24, 24)

// notes
// border type and color for pre-plays
  // needs to be turned on in menu

const next = () => {
  requestAnimationFrame(next)
}

const run = async () => {
  const image = new Image()
  image.src = './assets/tiles.png'
  console.log(image)

  // const grid = makeGrid(11, 11)

  // from: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
  // await Promise.all(
  //   Array.from(document.images).map(
  //     (image) =>
  //       new Promise((resolve) => image.addEventListener("load", resolve)),
  //   ),
  // );

  image.addEventListener('load', () => {
    const room = new Room([new Actor(), new Actor(), new Actor(), new Actor()])
    console.log(room)
    forEachGI(room.grid, (x, y, item) => {
      if (item == TileType.Wall) {
        ctx.drawImage(image, 0, 192, 12, 12, x * 14 + 1, y * 14 + 1, 12, 12)
      }
    })

    addLog('asdf')
    next()
  })
}

run()
