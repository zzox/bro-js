import { names } from './data/names'
import { addLog } from './ui/logs'
import { updatePlayerUi } from './ui/player-ui'
import { Actor } from './world/actor'
import { forEachGI, makeGrid, TileType } from './world/grid'
import { Room, RoomEvent, RoomResult } from './world/room'

console.log('bro')
// move to new file? or just new branch
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

const bgColor = window.getComputedStyle(document.body).getPropertyValue('--bg-color')
console.log(bgColor)

ctx.fillStyle = bgColor
ctx.fillRect(0, 0, canvas.width, canvas.height)

ctx.font = '16px serif'
ctx.fillStyle = 'white'
ctx.fillText(`${names[Math.floor(Math.random() * names.length)]} BroOoOoOoOoOo`, 24, 24)

// notes
// border type and color for pre-plays
  // needs to be turned on in menu


let image:HTMLImageElement
let room:Room
let roomActive:boolean = true
let actors:Actor[]

const handleRoomResult = (result:RoomResult) => {
  console.log(result)
  roomActive = false
}

const handleRoomEvent = (event:RoomEvent) => {
  console.log(event)
  updatePlayerUi(actors)
}

const update = () => {
  // Room.update()
  if (roomActive) {
    const result = room.update()
    if (result) {
      handleRoomResult(result)
    }
  }
}

// this assumes the same image for all
// we draw a 12x12 image on a grid of 14
const drawTile = (/*image:HTMLImageElement*/ index:number, x:number, y:number) => {
  const sx = index * 12 % image.width
  const sy = Math.floor(index * 12 / image.width) * 12
  ctx.drawImage(image, sx, sy, 12, 12, x * 14 + 1, y * 14 + 1, 12, 12)
}

const draw = () => {
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  forEachGI(room.grid, (x, y, item) => {
    if (item === TileType.Wall) {
      drawTile(4, x, y)
    } else if (item === TileType.Entrance) {
      drawTile(7, x, y)
    } else if (item === TileType.Exit) {
      drawTile(6, x, y)
    }
  })

  room.actors.forEach(actor => {
    drawTile(0, actor.bd.x, actor.bd.y)
  })

  room.elements.forEach(element => {
    drawTile(32, element.x, element.y)
  })

  // room.particles.forEach(particle => {
  //   drawTile(32, particle.x, particle.y)
  // })
}

const next = () => {
  update()
  draw()

  requestAnimationFrame(next)
}

const ready = () => {
  actors = [new Actor(), new Actor(), new Actor(), new Actor()]
  updatePlayerUi(actors)
  room = new Room(actors, handleRoomEvent)
  console.log(room)

  addLog('asdf')
  next()
}

const run = async () => {
  image = new Image()
  image.src = './assets/tiles.png'
  console.log(image)

  // const grid = makeGrid(11, 11)

  // from: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
  // await Promise.all(
  //   Array.from(document.images).map(
  //     (image) =>
  //       new Promise((resolve) => image.addEventListener('load', resolve)),
  //   ),
  // );

  image.addEventListener('load', ready)
}

run()
