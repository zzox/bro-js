import { actorData, ActorType } from './data/actor-data'
import { names } from './data/names'
import { spellData } from './data/spell-data'
import { createLogFromEvent } from './ui/logs'
import { updatePlayerUi } from './ui/player-ui'
import { logger, LogLevel, setLogLevel } from './util/logger'
import { Actor } from './world/actor'
import { forEachGI, makeGrid, TileType } from './world/grid'
import { Room, RoomEvent, RoomEventType, RoomResult } from './world/room'

setLogLevel(LogLevel.Debug)
logger.debug('bro :)')

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

ctx.font = '16px serif'
ctx.fillStyle = 'white'
ctx.fillText(`${names[Math.floor(Math.random() * names.length)]} BroOoOoOoOoOo`, 24, 24)

// notes
// border type and color for pre-plays
  // needs to be turned on in menu

type Particle = {
  tile:number
  time:number
  x:number
  y:number
  collTime:number
}

let image:HTMLImageElement
let room:Room
let roomActive:boolean = true
let actors:Actor[] = []
let particles:Particle[] = []

const handleRoomResult = (result:RoomResult) => {
  logger.debug('room result', result)
  roomActive = false
}

const handleRoomEvent = (event:RoomEvent) => {
  logger.debug('room event', event)
  updatePlayerUi(actors)
  if (event.type === RoomEventType.AttackEnd) {
    // right now its a sword
    particles.push({ tile: spellData.get(event.spell!)!.tile, collTime: 5, time: 30, x: event.x!, y: event.y! })
  }
  createLogFromEvent(event)
}

const update = () => {
  // Room.update()
  if (roomActive) {
    const result = room.update()
    if (result) {
      handleRoomResult(result)
    }

    particles.forEach(particle => {
      particle.time--
      particle.collTime--

      if (particle.collTime <= 0) {
        room.actors.forEach(actor => {
          // TODO: get isPosEq
          if (actor.bd.x === particle.x && actor.bd.x === particle.x) {
            particle.time = 0
          }
        })
      }
    })

    particles = particles.filter(p => p.time > 0)
  }
}

const clear = () => {
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

const clearTile = (x:number, y:number) => {
  ctx.fillStyle = bgColor
  ctx.fillRect(x * 14 + 1, y * 14 + 1, 12, 12)
}

// this assumes the same image for all
// we draw a 12x12 image on a grid of 14
// one of the right ways to flipX: https://stackoverflow.com/questions/35973441/how-to-horizontally-flip-an-image
const drawTile = (/*image:HTMLImageElement, */ index:number, x:number, y:number, flipX = false) => {
  const sx = index * 12 % image.width
  const sy = Math.floor(index * 12 / image.width) * 12
  clearTile(x, y)
  // dest x and dest y
  ctx.translate(x * 14 + 1 + (flipX ? 12 : 0), y * 14 + 1)
  ctx.scale(flipX ? -1 : 1, 1)
  ctx.drawImage(image, sx, sy, 12, 12, 0, 0, 12, 12)
  // reset transformations
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

const draw = () => {
  clear()
  forEachGI(room.grid, (x, y, item) => {
    if (item === TileType.Wall) {
      drawTile(130, x, y)
    } else if (item === TileType.Entrance) {
      drawTile(129, x, y)
    } else if (item === TileType.Exit) {
      drawTile(128, x, y)
    }
  })

  room.actors.forEach(actor => {
    if (actor.type === ActorType.Goblin) {
      drawTile(actorData.get(actor.type)!.tile, actor.bd.x, actor.bd.y)
    } else {
      drawTile(actorData.get(actor.type)!.tile, actor.bd.x, actor.bd.y)
    }
  })

  room.elements.forEach(element => {
    drawTile(spellData.get(element.type)!.tile, element.x, element.y)
  })

  particles.forEach(particle => {
    drawTile(particle.tile, particle.x, particle.y)
  })
}

const next = () => {
  update()
  draw()

  requestAnimationFrame(next)
}

const ready = () => {
  actors = [new Actor(ActorType.Knight), new Actor(ActorType.Knight), new Actor(ActorType.Knight), new Actor(ActorType.Knight)]
  updatePlayerUi(actors)
  room = new Room(actors, handleRoomEvent)
  next()
}

const run = async () => {
  image = new Image()
  image.src = './assets/tiles.png'

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
