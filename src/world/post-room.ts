import { getLevelFromExp } from '../data/actor-data'
import { Vec2, vec2 } from '../data/globals'
import { Actor } from './actor'
import { makeGrid } from './grid'
import { Room, RoomResult } from './room'

const roomPositions = [
  [vec2(5, 3)],
  [vec2(3, 3), vec2(7, 7)],
  [vec2(5, 3), vec2(8, 7), vec2(2, 7)],
  [vec2(3, 3), vec2(7, 3), vec2(7, 7), vec2(3, 7)],
  [vec2(5, 2), vec2(8, 4), vec2(7, 7), vec2(3, 7), vec2(2, 4)],
  [vec2(5, 2), vec2(8, 3), vec2(8, 7), vec2(5, 8), vec2(2, 7), vec2(2, 3)],
]

export enum PostRoomEventType {
  Exp,
  LvlUp,
  CanHeal,
  Emo
}

export type PostRoomEvent = {
  type:PostRoomEventType
  amount?:number
  from?:Vec2
  to?:Vec2
}

const updates = [
  PostRoomEventType.Exp,
  PostRoomEventType.LvlUp,
  PostRoomEventType.CanHeal,
  PostRoomEventType.Emo
]

export class PostRoom extends Room {
  onEvent:(e:PostRoomEvent) => void

  nextTime:number = 60
  actorNum:number = 0
  updateNum:number = 0
  checkNum:number = 0

  actorLevels:number[]

  constructor (playerTeam:Actor[], onEvent:(e:PostRoomEvent) => void) {
    super()

    this.grid = makeGrid(11, 11)

    this.onEvent = onEvent

    this.actors = playerTeam.map((a, i) => {
      a.bd.x = roomPositions[playerTeam.length - 1][i].x
      a.bd.y = roomPositions[playerTeam.length - 1][i].y
      a.bd.left = false
      return a
    })
    this.actorLevels = this.actors.map(a => a.level)
  }

  update(): RoomResult | null {
    this.nextTime--

    if (this.nextTime === 0) {
      while (true) {
        if (this.updateNum === updates.length) {
          return RoomResult.DoneUpdates
        }

        const actor = this.actors[this.actorNum]
        if (updates[this.updateNum] === PostRoomEventType.Exp) {
          if (actor.isAlive) {
            actor.experience += actor.bd.exp
            this.onEvent({ type: PostRoomEventType.Exp, amount: actor.bd.exp, from: vec2(actor.bd.x, actor.bd.y) })
            // actor.bd.exp = 0 // maybe not needed as it will be reset in the next room
            this.nextActor()
            break
          }
        } else if (updates[this.updateNum] === PostRoomEventType.LvlUp) {
          actor.level = getLevelFromExp(actor.experience)
          if (actor.level > this.actorLevels[this.actorNum]) {
            this.onEvent({ type: PostRoomEventType.LvlUp, from: vec2(actor.bd.x, actor.bd.y) })
            this.nextActor()
            break
          }
        }

        this.nextActor()
      }

      this.nextTime += 60
    }

    return null
  }

  nextActor = () => {
    this.actorNum++
    if (this.actorNum === this.actors.length) {
      this.updateNum++
      this.actorNum = 0
    }
  }
}
