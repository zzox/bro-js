import { vec2, Vec2 } from '../data/globals'
import { Diagonal, pathfind } from '../util/pathfind'
import { recycle } from '../util/utils'
import { Actor } from './actor'
import { Grid, TileItem, makeGrid, mapGI, TileType, makeIntGrid, getGridItem } from './grid'

export enum RoomResult {
  EveryoneGone = 'EveryoneGone',
  EnemiesGone = 'EnemiesGone',
  PlayersGone = 'PlayersGone',
}

const isPosEq = (x1:number, y1:number, x2:number, y2:number) => x1 === x2 && y1 === y2

const genEnemies = ():Actor[] => {
  return [new Actor()]
}

const entranceDiffs = [vec2(0, -1), vec2(1, 0), vec2(0, 1), vec2(-1, 0)]

enum RoomEventType {
  Death,
  Damage,
}

export type RoomEvent = {
  type:RoomEventType
  amount:number
}

export class Room {
  grid:Grid<TileItem>

  actors:Actor[] = []

  exit:Vec2 = vec2(9, 1)
  entrance:Vec2 = vec2(2, 8)

  onEvent:(e:RoomEvent) => void

  constructor (playerTeam:Actor[], onEvent:(e:RoomEvent) => void) {
    console.log(playerTeam)
    const enemies = genEnemies()

    this.grid = mapGI(makeGrid(11, 11), (x, y, item) => {
      if (x == 0 || x == 10 || y == 0 || y == 10) {
        return TileType.Wall
      }

      if (isPosEq(this.entrance.x, this.entrance.y, x, y)) {
        return TileType.Entrance
      }

      if (isPosEq(this.exit.x, this.exit.y, x, y)) {
        return TileType.Exit
      }

      return null
    })

    playerTeam.forEach((player, i) => {
      const diff = entranceDiffs[i]
      player.newBattle(this.entrance.x + diff.x, this.entrance.y + diff.y, true)
    })

    enemies.forEach(enemy => {
      enemy.newBattle(1, 1, false)
    })

    this.actors = this.actors.concat(playerTeam, enemies)

    this.onEvent = onEvent
  }

  update ():RoomResult | null {
    this.actors.forEach(this.step)

    // remove actor at exit
    const [found] = this.actors.filter(actor => isPosEq(actor.bd.x, actor.bd.y, this.exit.x, this.exit.y))
    if (found != null) {
      this.actors = this.actors.filter(actor => actor !== found)
    }

    if (this.actors.length === 0) {
      return RoomResult.EveryoneGone
    }
    if (this.getPlayers().length === 0) {
      return RoomResult.PlayersGone
    }
    // if (this.getEnemies().length === 0) {
    //   return RoomResult.EnemiesGone
    // }

    return null
  }

  step = (actor:Actor) => {
    actor.bd.stateTime--
    if (actor.bd.stateTime > 0) return

    const path = pathfind(this.makeMap(actor), vec2(actor.bd.x, actor.bd.y), this.exit, Diagonal, true)
    if (!path) throw 'Path not found'

    const items = recycle(path)

    // TEMP:
    actor.health -= 1

    this.onEvent({ type: RoomEventType.Damage, amount: 1 })

    actor.bd.x = items[0].x
    actor.bd.y = items[0].y
    actor.bd.stateTime = 10 + Math.floor(Math.random() * 10)
  }

  makeMap (actor:Actor) {
    return mapGI(makeIntGrid(11, 11), (x, y, _) => {
      const tile = getGridItem(this.grid, x, y)
      return tile === null && (!this.actorAt(x, y) || this.actorAt(x, y) === actor) ? 1 : 0
    })
  }

  getPlayers ():Actor[] {
    return this.actors.filter(actor => actor.bd.isPlayer)
  }

  getEnemies ():Actor[] {
    return this.actors.filter(actor => !actor.bd.isPlayer)
  }

  actorAt (x:number, y:number):Actor | undefined {
    return this.actors.find(a => a.bd.x === x && a.bd.y === y)
  }
}
