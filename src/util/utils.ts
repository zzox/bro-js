import { vec2, Vec2 } from '../data/globals'

// create new vec2s for ones that will be reused
export const recycle = (vecs:Vec2[]):Vec2[] => vecs.map(v => vec2(v.x, v.y))

export const distanceBetween = (x1:number, y1:number, x2:number, y2:number):number =>
  Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))

const toRadians = (value:number):number => {
  return value * (Math.PI / 180)
}

const toDegrees = (value:number):number => {
  return value / (Math.PI / 180)
}

// from: https://github.com/HaxeFlixel/flixel/blob/dev/flixel/math/FlxVelocity.hx
export const velocityFromAngle = (angle:number, velocity:number):Vec2 => {
  const a = toRadians(angle)
  return new Vec2(Math.cos(a) * velocity, Math.sin(a) * velocity)
}

// from: https://stackoverflow.com/questions/2676719/calculating-the-angle-between-a-line-and-the-x-axis
export const angleFromPoints = (p1x:number, p1y:number, p2x:number, p2y:number):number => {
  return toDegrees(Math.atan2(p1y - p2y, p1x - p2x))
}
