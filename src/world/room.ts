import { vec2, Vec2 } from '../data/globals'
import { Diagonal, pathfind } from '../util/pathfind'
import { Actor } from './actor'
import { forEachGI, Grid, TileItem, makeGrid, mapGI, TileType, makeIntGrid } from './grid'

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
        stateTime: 10
      }
    })

    enemies.forEach(enemy => {
      enemy.battleData = {
        x: 1,
        y: 1,
        stateTime: 10
      }
    })

    this.actors = this.actors.concat(playerTeam, enemies)
  }

  update () {
    this.actors.forEach(actor => {
      console.log(pathfind(makeIntGrid(11, 11), vec2(actor.bd.x, actor.bd.y), this.exit, Diagonal, true))
      actor.bd.stateTime--
      if (actor.bd.stateTime > 0) return

      actor.bd.x += Math.random() < 0.5 ? -1 : 1
      actor.bd.y += Math.random() < 0.5 ? -1 : 1
      actor.bd.stateTime = Math.floor(Math.random() * 10)
    })
  }
}