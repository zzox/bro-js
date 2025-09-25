import { actorData, ActorType } from '../data/actor-data'
import { vec2, Vec2 } from '../data/globals'
import { getActorSpellData, spellData, SpellType, SQRT2 } from '../data/spell-data'
import { logger } from '../util/logger'
import { Diagonal, pathfind } from '../util/pathfind'
import { makeLine } from '../util/raytrace'
import { distanceBetween, findNearest, isPosEq, recycle } from '../util/utils'
import { Actor, ActorState, Behavior } from './actor'
import { Grid, TileItem, makeGrid, mapGI, TileType, makeIntGrid, getGridItem } from './grid'

export enum RoomResult {
  EveryoneGone = 'EveryoneGone',
  EnemiesGone = 'EnemiesGone',
  PlayersGone = 'PlayersGone',
}

const genEnemies = ():Actor[] => {
  return [new Actor(ActorType.Goblin)]
}

const entranceDiffs = [vec2(0, -1), vec2(1, 0), vec2(0, 1), vec2(-1, 0)]

export enum RoomEventType {
  Death = 'Death',
  Damage = 'Damage',
  Attack = 'Attack',
  AttackEnd = 'AttackEnd',
  Leave = 'Leave',
}

export type RoomEvent = {
  type:RoomEventType
  amount?:number
  from?:Actor
  to?:Actor
  spell?:SpellType
  x?:number
  y?:number
}

export type RElement = {
  type:SpellType
  x:number
  y:number
  time:number
  from:Actor
  path:Vec2[]
  damaged:Actor[]
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
      this.onEvent({ type: RoomEventType.Leave, from: found })
      this.actors = this.actors.filter(actor => actor !== found)
    }

    // check actors against elements
    this.elements.forEach(this.updateElement)
    this.elements = this.elements.filter(el => el.time > 0)

    this.actors.forEach(a => !a.isAlive && this.onEvent({ type: RoomEventType.Death, to: a }))
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
    element.damaged.push(actor)
    this.onEvent({ type: RoomEventType.Damage, amount: damage, to: actor, from: element.from })
  }

  updateElement = (element:RElement) => {
    element.time--

    if (element.time === 0 && element.path.length) {
      // try to move, check collisions
      // if colliding with wall, set time to 0
      // for now, if we collide with an enemy, we keep going
      const next = element.path.shift()
      if (next && this.checkCollisions(next.x, next.y)) {
        element.x = next.x
        element.y = next.y
        element.time = spellData.get(element.type)!.time
      } else {
        element.time = 0
      }
    }

    this.actors.forEach(actor => {
      if (isPosEq(actor.bd.x, actor.bd.y, element.x, element.y) && !element.damaged.includes(actor)) {
        this.damageActor(actor, element)
      }
    })

    if (element.time === 0) {
      this.onEvent({ type: RoomEventType.AttackEnd, x: element.x, y: element.y, spell: element.type, from: element.from, amount: element.damaged.length })
    }
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

      const nearestDist = distanceBetween(actor.bd.x, actor.bd.y, nearest.bd.x, nearest.bd.y)

      // sqrt(2) is under 1.5

      if (nearestDist <= getActorSpellData(actor).range) {
        this.tryAttack(actor, nearest.bd.x, nearest.bd.y)
      } else {
        this.tryMoveActor(actor, nearest.bd.x, nearest.bd.y)
      }
    } else if (actor.behavior === Behavior.Evade) {
      this.tryMoveActor(actor, this.exit.x, this.exit.y)
    }
  }

  addElement (actor:Actor) {
    const spell = getActorSpellData(actor)

    const ranged = spell.range > SQRT2
    const path = ranged ? makeLine(actor.bd.x, actor.bd.y, actor.bd.attackPos!.x, actor.bd.attackPos!.y) : []

    // first is actually second, because we get rid of the first
    if (ranged) {
      const zeroth = path.shift()
      console.log(zeroth!.x === actor.bd.x && zeroth!.y === actor.bd.y)
    }
    const first = path.shift()

    const startX = ranged ? first!.x : actor.bd.attackPos!.x
    const startY = ranged ? first!.y : actor.bd.attackPos!.y

    this.elements.push({
      type: actorData.get(actor.type)!.offSpell!,
      x: startX,
      y: startY,
      path,
      damaged: [],
      time: spell.time,
      from: actor
    })
  }

  tryAttack (actor:Actor, x:number, y:number) {
    actor.bd.attackPos = vec2(x, y)
    actor.bd.state = ActorState.PreAttack
    actor.bd.stateTime = 30 // lookup from spell
  }

  doAttack (actor:Actor) {
    if (!actor.bd.attackPos) throw 'No Attack Pos!'
    this.addElement(actor)
    this.onEvent({ type: RoomEventType.Attack, from: actor, x: actor.bd.attackPos.x, y: actor.bd.attackPos.y })
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

  checkCollisions (x:number, y:number) {
    return getGridItem(this.grid, x, y) !== TileType.Wall
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
