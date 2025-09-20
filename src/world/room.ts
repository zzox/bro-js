import { Actor } from './actor'
import { forEachGI, Grid, makeGrid, mapGI, TileType } from './grid'

const genEnemies = ():Actor[] => {
  return [new Actor()]
}

export class Room {
  grid:Grid

  constructor (playerTeam:Actor[]) {
    console.log(playerTeam)
    const enemies = genEnemies();

    this.grid = mapGI(makeGrid(11, 11), (x, y, item) => {
      if (x == 0 || x == 10 || y == 0 || y == 10) {
        return TileType.Wall
      }

      return null
    })
  }
}