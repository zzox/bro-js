export enum TileType {
  Wall = 'wall',
  Exit = 'exit',
  Entrance = 'entrance',
}

export type TileItem = TileType | null;

export type Grid<T> = {
  items: T[];
  width: number;
  height: number;
}

export const makeGrid = (width:number, height:number):Grid<TileItem> => {
  return {
    width: width,
    height: height,
    items: [...new Array(width * height)].map(_ => null)
  }
}

export const forEachGI = <T>(grid:Grid<T>, cb:(x:number, y:number, item:T) => void) => {
  grid.items.forEach((_, i) => {
    cb(i % grid.width, Math.floor(i / grid.width), grid.items[i])
  })
}

export const mapGI = <T>(grid:Grid<T>, cb:(x:number, y:number, item:T) => T):Grid<T> => (
  {
    width: grid.width,
    height: grid.height,
    items: grid.items.map((_, i) => cb(i % grid.width, Math.floor(i / grid.width), grid.items[i]))
  }
)

export const getGridItem = <T>(grid:Grid<T>, x:number, y:number):T | undefined => {
  if (x < 0 || y < 0 || x > grid.width || y >= grid.height) return undefined
  return grid.items[x + y * grid.width]
}

// TODO: collapse into generics
export const makeIntGrid = (width:number, height:number):Grid<number> => {
  return {
    width: width,
    height: height,
    items: [...new Array(width * height)].map(_ => 1)
  }
}
