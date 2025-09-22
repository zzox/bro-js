import { vec2, Vec2 } from '../data/globals'
import { Diagonal, pathfind } from '../util/pathfind'
import { recycle } from '../util/utils'
import { Actor } from './actor'
import { Grid, TileItem, makeGrid, mapGI, TileType, makeIntGrid } from './grid'

enum RoomResult {
  EnemiesGone = 0,
  EveryoneGone = 1,
}

const isPosEq = (x1:number, y1:number, x2:number, y2:number) => x1 === x2 && y1 === y2

const genEnemies = ():Actor[] => {
  return [new Actor()]
}

export class Room {
  grid:Grid<TileItem>

  actors:Actor[] = []

  exit:Vec2 = vec2(9, 1);
  entrance:Vec2 = vec2(2, 8);

  constructor (playerTeam:Actor[]) {
    console.log(playerTeam)
    const enemies = genEnemies()

    this.grid = mapGI(makeGrid(11, 11), (x, y, item) => {
      if (x == 0 || x == 10 || y == 0 || y == 10) {
        return TileType.Wall
      }

      return null
    })

    playerTeam.forEach(player => {
      player.battleData = {
        x: this.entrance.x,
        y: this.entrance.y,
        stateTime: 10,
        isPlayer: true
      }
    })

    enemies.forEach(enemy => {
      enemy.battleData = {
        x: 1,
        y: 1,
        stateTime: 10,
        isPlayer: false
      }
    })

    this.actors = this.actors.concat(playerTeam, enemies)
  }

  update ():RoomResult | null {
    this.actors.forEach(actor => {
      actor.bd.stateTime--
      if (actor.bd.stateTime > 0) return

      const path = pathfind(makeIntGrid(11, 11), vec2(actor.bd.x, actor.bd.y), this.exit, Diagonal, true)
      if (!path) throw 'Path not found'

      const items = recycle(path)

      actor.bd.x = items[0].x
      actor.bd.y = items[0].y
      actor.bd.stateTime = Math.floor(Math.random() * 10)
    })

    // remove actor at exit
    const [found] = this.actors.filter(actor => isPosEq(actor.bd.x, actor.bd.y, this.exit.x, this.exit.y))
    if (found != null) {
      this.actors = this.actors.filter(actor => actor !== found)
    }

    return null
  }
}
