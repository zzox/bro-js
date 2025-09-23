import { vec2, Vec2 } from '../data/globals'

// create new vec2s for ones that will be reused
export const recycle = (vecs:Vec2[]):Vec2[] => vecs.map(v => vec2(v.x, v.y))

export const distanceBetween = (x1:number, y1:number, x2:number, y2:number):number =>
  Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
