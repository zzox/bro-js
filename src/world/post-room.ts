import { vec2 } from '../data/globals'
import { Actor } from './actor'
import { makeGrid } from './grid'
import { Room, RoomResult } from './room'

const roomPositions = [
  [vec2(5, 3)],
  [vec2(3, 3), vec2(7, 7)],
  [vec2(5, 3), vec2(2, 7), vec2(8, 7)],
  [vec2(3, 3), vec2(7, 3), vec2(3, 7), vec2(7, 7)],
  [vec2(5, 2), vec2(2, 4), vec2(8, 4), vec2(3, 7), vec2(7, 7)],
  [vec2(5, 2), vec2(2, 3), vec2(8, 3), vec2(2, 7), vec2(8, 7), vec2(5, 8)],
]

export enum PostRoomEventType {
  StatusChange
}

export type PostRoomEvent = {
  type:PostRoomEventType
}

export class PostRoom extends Room {
  onEvent:(e:PostRoomEvent) => void

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
  }

  update(): RoomResult | null {
    return null
  }
}
