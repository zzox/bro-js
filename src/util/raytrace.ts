import { vec2, Vec2 } from '../data/globals'
import { angleFromPoints, velocityFromAngle } from './utils'

const swap = <T>(p1:T, p2:T):T[] => [p2, p1]

// from: https://github.com/deepnight/deepnightLibs/blob/master/src/dn/geom/Bresenham.hx
const raytrace = (x1:number, y1:number, x2:number, y2:number, respectOrder = false):Vec2[] => {  
  var pts:Vec2[] = []
  var swapXY = Math.abs(y2 - y1) > Math.abs(x2 - x1)
  var swapped = false
  if (swapXY) {
    // swap x and y
    ;[x1, y1] = swap(x1, y1)
    ;[x2, y2] = swap(x2, y2)
    // tmp = x1; x1 = y1; y1 = tmp; // swap x1 and y1
    // tmp = x2; x2 = y2; y2 = tmp; // swap x2 and y2
  }
  if (x1 > x2) {
      // make sure x1 < x2
      // tmp = x1; x1 = x2; x2 = tmp; // swap x1 and x2
      // tmp = y1; y1 = y2; y2 = tmp; // swap y1 and y2
      ;[x1, x2] = swap(x1, x2)
      ;[y1, y2] = swap(y1, y2)
      swapped = true
  }
  var deltax = x2 - x1
  var deltay = Math.floor(Math.abs(y2 - y1))
  var error = Math.floor(deltax / 2)
  var y = y1
  var ystep = y1 < y2 ? 1 : -1
  if (swapXY) {
    // Y / X
    for (let x = x1; x <= x2; x++) {
      pts.push(vec2(y, x))
      error -= deltay
      if (error < 0) {
        y+=ystep
        error = error + deltax
      }
    }
  } else {
    // X / Y
    for (let x = x1; x <= x2; x++) {
      pts.push(vec2(x, y))
      error -= deltay
      if (error < 0) {
        y += ystep
        error = error + deltax
      }
    }
  }

  if(swapped && respectOrder) pts.reverse()

  return pts
}

// WARN: depends on game size, if we go over 25x25 this wont work
const MAX_DISTANCE = Math.ceil(Math.sqrt(Math.pow(25, 2) + Math.pow(25, 2)));

const raytraceFromAngle = (posX:number, posY:number, angle:number):Vec2[] => {
  const dist = velocityFromAngle(angle, MAX_DISTANCE);
  return raytrace(posX, posY, Math.round(posX + dist.x), Math.round(posY + dist.y), true);
}

// makes a line `MAX_DISTANCE` away using decided angle, can be of different lengths
export const makeLine = (x0:number, y0:number, x1:number, y1:number, angleMod:number = 0):Vec2[] => {
  const angle = angleFromPoints(x1, y1, x0, y0) + angleMod
  return raytraceFromAngle(x0, y0, angle);
}
