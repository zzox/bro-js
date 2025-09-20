enum TileType {
  Wall = 'wall',
  Exit = 'exit',
  Entrance = 'entrance',
}

export type GridItem = TileType | null;

export type Grid = {
  items: GridItem[];
  width: number;
  height: number;
}

export const makeGrid = <T>(width:number, height:number):Grid => {
  return {
    width: width,
    height: height,
    items: [...new Array(width * height)].map(_ => null)
  }
}

export const forEachGI = (grid:Grid, cb:(x:number, y:number, item:GridItem) => void) => {
  grid.items.forEach((_, i) => {
    cb(i % grid.width, Math.floor(i / grid.width), grid.items[i])
  })
}
