import { vec2, Vec2 } from '../data/globals'
import { logger } from '../util/logger'
import { Diagonal, pathfind } from '../util/pathfind'
import { distanceBetween, recycle } from '../util/utils'
import { Actor, ActorState, Behavior } from './actor'
import { Grid, TileItem, makeGrid, mapGI, TileType, makeIntGrid, getGridItem } from './grid'

export enum RoomResult {
  EveryoneGone = 'EveryoneGone',
  EnemiesGone = 'EnemiesGone',
  PlayersGone = 'PlayersGone',
}

// TODO: remove methods or move to utils?
const isPosEq = (x1:number, y1:number, x2:number, y2:number) => x1 === x2 && y1 === y2

const genEnemies = ():Actor[] => {
  return [new Actor()]
}

const findNearest = (x:number, y:number, actors:Array<Actor>):Actor | null => {
  var nearest = null
  // WARN:
  var nearestDist = 1000.0
  actors.forEach(a => {
    const distance = distanceBetween(a.bd.x, a.bd.y, x, y)
    if (distance < nearestDist) {
      nearest = a
      nearestDist = distance
    }
  })

  return nearest
}

const entranceDiffs = [vec2(0, -1), vec2(1, 0), vec2(0, 1), vec2(-1, 0)]

enum RoomEventType {
  Death,
  Damage,
}

export type RoomEvent = {
  type:RoomEventType
  amount?:number
  who?:Actor
}

export type RElement = {
  x:number
  y:number
  path:Vec2[]
  time:number
  from:Actor
}

export class Room {
  grid:Grid<TileItem>

  actors:Actor[] = []

  elements:RElement[] = []

  exit:Vec2 = vec2(9, 1)
  entrance:Vec2 = vec2(2, 8)

  onEvent:(e:RoomEvent) => void

  constructor (playerTeam:Actor[], onEvent:(e:RoomEvent) => void) {
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
    // do each actors actions
    this.actors.forEach(this.updateActor)

    // remove actor at exit
    const [found] = this.actors.filter(actor => isPosEq(actor.bd.x, actor.bd.y, this.exit.x, this.exit.y))
    if (found != null) {
      this.actors = this.actors.filter(actor => actor !== found)
    }

    // check actors against elements
    this.elements.forEach(this.updateEl)
    this.elements = this.elements.filter(el => el.time > 0)

    this.actors.forEach(a => !a.isAlive && this.onEvent({ type: RoomEventType.Death, who: a }))
    this.actors = this.actors.filter(a => a.isAlive)

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

  damageActor = (actor:Actor, element:RElement) => {
    // TODO: figure damage
    const damage = Math.floor(Math.random() * 12)
    actor.health -= damage
    actor.bd.damagedBy.push(element)
    this.onEvent({ type: RoomEventType.Damage, amount: damage })
  }

  updateEl = (element:RElement) => {
    element.time--

    this.actors.forEach(actor => {
      if (isPosEq(actor.bd.x, actor.bd.y, element.x, element.y) && !actor.bd.damagedBy.includes(element)) {
        this.damageActor(actor, element)
      }
    })

    if (element.time === 0) {
      this.clearDamagedBy(element)
    }
  }

  clearDamagedBy = (element:RElement) => {
    this.actors.forEach(actor => {
      actor.bd.damagedBy = actor.bd.damagedBy.filter(el => el != element)
    })
  }

  updateActor = (actor:Actor) => {
    actor.bd.stateTime--
    if (actor.bd.stateTime > 0) return

    if (actor.bd.state == ActorState.Attack) {
      actor.bd.state = ActorState.Wait
    }

    if (actor.bd.state === ActorState.PreAttack) {
      this.doAttack(actor)
    }

    // if we arent waiting, we should return
    if (actor.bd.state !== ActorState.Wait) return

    if (actor.behavior === Behavior.Aggro) {
      const nearest = findNearest(actor.bd.x, actor.bd.y, actor.bd.isPlayer ? this.getEnemies() : this.getPlayers())
      if (!nearest) {
        // leave if there's noone
        this.tryMoveActor(actor, this.exit.x, this.exit.y)
        return
      }

      const nearestDist = distanceBetween(actor.bd.x, actor.bd.y, nearest.bd.x, nearest.bd.x)

      // sqrt(2) is under 1.5
      const spellDistance = 1.5
      if (nearestDist <= spellDistance) {
        this.tryAttack(actor, nearest.bd.x, nearest.bd.y)
      } else {
        this.tryMoveActor(actor, nearest.bd.x, nearest.bd.y)
      }
    } else if (actor.behavior === Behavior.Evade) {
      this.tryMoveActor(actor, this.exit.x, this.exit.y)
    }
  }

  addElement(actor:Actor) {
    this.elements.push({ x: actor.bd.attackPos!.x, y: actor.bd.attackPos!.y, path: [], time: 1, from: actor })
  }

  tryAttack (actor:Actor, x:number, y:number) {
    actor.bd.attackPos = vec2(x, y)
    actor.bd.state = ActorState.PreAttack
    actor.bd.stateTime = 30 // lookup from spell
  }

  doAttack (actor:Actor) {
    if (!actor.bd.attackPos) throw 'No Attack Pos!'
    this.addElement(actor)
    actor.bd.attackPos = undefined
    actor.bd.state = ActorState.Attack
    actor.bd.stateTime = 60 // lookup from spell, add dexterity
  }

  tryMoveActor (actor:Actor, targetX:number, targetY:number) {
    const path = pathfind(this.makeMap(actor), vec2(actor.bd.x, actor.bd.y), vec2(targetX, targetY), Diagonal, true)
    if (!path) {
      logger.debug('path not found')
      // TODO: stateTime of 1
      actor.bd.stateTime = 60
      return
    }
    const items = recycle(path)

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
