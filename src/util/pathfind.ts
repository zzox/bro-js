// import core.Types
// import game.world.Grid

import { vec2, Vec2 } from '../data/globals'
import { getGridItem, Grid } from '../world/grid'
import { logger } from './logger'

// from: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
type Heuristic = (p1:Vec2, p2:Vec2) => number

// WARN: a static class like this needs to be safe, multiple pathfinds at once
// could cause issues. also requires us recycling these items
class Points {
  static index:number = 0
  static items:Array<Vec2> = []
  static getItem(x:number, y:number):Vec2 {
    const item = this.items[this.index]
    if (item != null) {
      item.set(x, y)
      this.index++
      return item
    }

    this.index++
    this.items.push(vec2(x, y))
    return this.items[this.index - 1]
  }

  static makeItems () {}
}

export const Manhattan = (p1:Vec2, p2:Vec2):number => {
  const d1 = Math.abs(p2.x - p1.x)
  const d2 = Math.abs(p2.y - p1.y)
  return d1 + d2
}

export const Diagonal = (p1: Vec2, p2: Vec2):number => {
  const d1 = Math.abs(p2.x - p1.x)
  const d2 = Math.abs(p2.y - p1.y)
  return d1 + d2 + ((Math.sqrt(2) - 2) * Math.min(d1, d2))
}

class PathNode {
  point:Vec2
  tail?:PathNode
  cost:number = 0.0
  h:number = 0.0

  constructor (point:Vec2, tail?:PathNode) {
    this.point = point
    this.tail = tail
  }
}

class Heap {
  nodes: Array<PathNode> = []

  addNode (node: PathNode) {
    this.nodes.push(node)
    this.nodes.sort((n1, n2) => Math.round(n1.cost + n1.h) - Math.round(n2.cost + n2.h))
    // this.nodes = this.nodes.sort((n1, n2) -> (n1.cost + n1.h) - (n2.cost + n2.h))
  }

  popNode (): PathNode | undefined {
    return this.nodes.shift()
  }
}

// TODO: better name, isn't exactly a hash set.
class HashSet {
  // combined x,y position -> cost
  items:Map<number, number> = new Map()
  width:number

  constructor (width: number) {
    this.width = width
  }

  getItem (point: Vec2): number | undefined  {
    return this.items.get(point.y * this.width + point.x)
  }

  setItem (point: Vec2, cost: number) {
    this.items.set(point.y * this.width + point.x, cost)
  }
}

function checkPointsEqual (point1:Vec2, point2:Vec2):boolean {
  return point1.x == point2.x && point1.y == point2.y
}

function createPathFrom (node: PathNode): Array<Vec2> {
  const items:Array<Vec2> = []

  while (node.tail != null) {
    items.push(node.point)
    node = node.tail
  }

  items.reverse()

  return items
}

function checkCanMoveTo (grid:Grid<number>, pointX:number, pointY:number, targetX:number, targetY:number):boolean {
  // if out of bounds or has an actor or obstacle that's not the target, return false
  const gridItem = getGridItem(grid, pointX, pointY)
  return !(
    gridItem == null ||
    // pointX < 0 || pointY < 0 || pointX >= grid.width || pointY >= grid.height ||
    !(gridItem != 0 || (pointX == targetX && pointY == targetY))
  )
}

function getNeighbors (grid:Grid<number>, point:Vec2, target:Vec2, canGoDiagonal:boolean = false): Array<Vec2> {
  const neighbors:Array<Vec2> = []

  // N, S, E, W
  if (checkCanMoveTo(grid, point.x, point.y - 1, target.x, target.y)) {
    neighbors.push(Points.getItem(point.x, point.y - 1))
  }
  if (checkCanMoveTo(grid, point.x, point.y + 1, target.x, target.y)) {
    neighbors.push(Points.getItem(point.x, point.y + 1))
  }
  if (checkCanMoveTo(grid, point.x + 1, point.y, target.x, target.y)) {
    neighbors.push(Points.getItem(point.x + 1, point.y))
  }
  if (checkCanMoveTo(grid, point.x - 1, point.y, target.x, target.y)) {
    neighbors.push(Points.getItem(point.x - 1, point.y))
  }

  // NE, SE, NW, SW
  if (canGoDiagonal) {
    if (checkCanMoveTo(grid, point.x + 1, point.y - 1, target.x, target.y)) {
      neighbors.push(Points.getItem(point.x + 1, point.y - 1))
    }
    if (checkCanMoveTo(grid, point.x + 1, point.y + 1, target.x, target.y)) {
      neighbors.push(Points.getItem(point.x + 1, point.y + 1))
    }
    if (checkCanMoveTo(grid, point.x - 1, point.y - 1, target.x, target.y)) {
      neighbors.push(Points.getItem(point.x - 1, point.y - 1))
    }
    if (checkCanMoveTo(grid, point.x - 1, point.y + 1, target.x, target.y)) {
      neighbors.push(Points.getItem(point.x - 1, point.y + 1))
    }
  }

  return neighbors
}

function getMovementCost (grid:Grid<number>, fromPoint: Vec2, toPoint: Vec2):number {
  const pointCost = getGridItem(grid, fromPoint.x, fromPoint.y)

  if (!pointCost) throw 'no point cost'

  var multi:number = 1
  if (fromPoint.x - toPoint.x != 0 && fromPoint.y - toPoint.y != 0) {
    multi *= Math.sqrt(2)
  }

  return pointCost * multi
}

export function pathfind (
  grid:Grid<number>,
  startPoint:Vec2,
  endPoint:Vec2,
  heuristic:Heuristic,
  canGoDiagonal:boolean = false
):Vec2[] | null {
  const startNode = new PathNode(startPoint)

  const visited = new HashSet(grid.width)

  Points.index = 0

  // our heap of possible selections
  const heap = new Heap()
  // push node to a sorted queue of open items
  heap.addNode(startNode)

  // TEMP:
  var iterations = 0
  while (heap.nodes.length > 0) {
    const currentNode = heap.popNode()

    if (currentNode == null) {
      throw 'Undefined node!'
    }

    // check if this start equals the end
    if (checkPointsEqual(endPoint, currentNode.point)) {
      return createPathFrom(currentNode)
    }

    const neighbors = getNeighbors(grid, currentNode.point, endPoint, canGoDiagonal)
    neighbors.forEach(neighbor => {
      // find cost for neighbor, include cost to this point
      const newCost = currentNode.cost + getMovementCost(grid, currentNode.point, neighbor)

      // TODO:
      // use heuristic to find estimated cost (alloted + estimate distance)

      // if the visited item exists and has a lower cost, don't do anything with this neighbor
      const visitedItem = visited.getItem(neighbor)
      if (visitedItem == null || newCost < visitedItem) {
        const newNode = new PathNode(neighbor, currentNode)
        newNode.cost = newCost
        newNode.h = heuristic(neighbor, endPoint)
        heap.addNode(newNode)
        visited.setItem(neighbor, newCost)
      }
    })

    // safeguarding against infinite loops. may be unnecessary.
    if (++iterations > 5000) {
      // WARN:
      logger.error('too many iterations')
      break
    }
  }

  return null
}
