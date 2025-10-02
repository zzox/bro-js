import { ActorType, Behavior, getExpGainFromStats } from '../data/actor-data'
import { vec2, Vec2 } from '../data/globals'
import { getActorSpell, getActorSpellData, spellData, SpellType, FSQRT2, isMagic } from '../data/spell-data'
import { logger } from '../util/logger'
import { Diagonal, pathfind } from '../util/pathfind'
import { makeLine } from '../util/raytrace'
import { distanceBetween, findNearest, isPosEq, recycle } from '../util/utils'
import { Actor, ActorState } from './actor'
import { Grid, TileItem, makeGrid, mapGI, TileType, makeIntGrid, getGridItem } from './grid'

export enum RoomResult {
  EveryoneGone = 'EveryoneGone',
  EnemiesGone = 'EnemiesGone',
  PlayersGone = 'PlayersGone',
}

const genEnemies = ():Actor[] => {
  return [new Actor(ActorType.Goblin), new Actor(ActorType.Goblin), new Actor(ActorType.Goblin)]
}

const entranceDiffs = [vec2(0, -1), vec2(1, 0), vec2(0, 1), vec2(-1, 0)]

// does the actor need the help this spell would provide
const needsHelp = (actor:Actor, spell:SpellType) =>
  actor.health / actor.maxHealth < 0.33

export enum RoomState {
  PreBattle,
  Battle,
  PostBattle,
}

export enum RoomEventType {
  Death = 'Death',
  Damage = 'Damage',
  Spell = 'Spell',
  SpellEnd = 'SpellEnd',
  Leave = 'Leave',
  Exp = 'Exp',
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
  grid!:Grid<TileItem>
  actors:Actor[] = []
  elements:RElement[] = []

  constructor () {}

  update ():RoomResult | null {
    throw 'Room:update() not implemented'
  }
}

export class BattleRoom extends Room {
  state:RoomState = RoomState.PreBattle

  exit:Vec2 = vec2(9, 1)
  entrance:Vec2 = vec2(2, 8)

  onEvent:(e:RoomEvent) => void

  constructor (playerTeam:Actor[], onEvent:(e:RoomEvent) => void) {
    super()
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

    const tempEnemyPos = [{ x: 1, y: 1 }, { x: 9, y: 9 }, { x: 8, y: 2 }]
    enemies.forEach((enemy, i) => {
      enemy.newBattle(tempEnemyPos[i].x, tempEnemyPos[i].y, false)
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
      found.bd.left = true
    }

    // check actors against elements
    this.elements.forEach(this.updateElement)
    this.elements = this.elements.filter(el => el.time > 0)

    this.actors.forEach(a => {
      if (!a.isAlive) {
        this.onEvent({ type: RoomEventType.Death, to: a })
        if (a.bd.damagedBy.length) {
          const exp = Math.floor(getExpGainFromStats(a.bd.stats) / a.bd.damagedBy.length)
          a.bd.damagedBy.forEach(adb => {
            // alert when the player gets some experience
            if (adb.bd.isPlayer && adb.isAlive) {
              this.onEvent({ type: RoomEventType.Exp, amount: exp, from: adb })
            }
            adb.bd.exp += exp
          })
        }
      }
    })
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

  affectActor = (actor:Actor, element:RElement) => {
    const data = spellData.get(element.type)!

    // if magic, the power is int
    const p = isMagic(element.type) ? actor.bd.stats.Int : actor.bd.stats.Power

    const damage = Math.floor(data.damage * (1 + p / 128))

    actor.health = Math.min(actor.health - damage, actor.maxHealth)
    element.damaged.push(actor)
    this.onEvent({ type: RoomEventType.Damage, amount: damage, to: actor, from: element.from, x: element.x, y: element.y })

    if (damage > 0) {
      if (!actor.bd.damagedBy.includes(element.from)) {
        actor.bd.damagedBy.push(element.from)
      }
    } else {
      if (!actor.bd.healedBy.includes(element.from)) {
        actor.bd.healedBy.push(element.from)
      }
    }

    // if we cannot pass through an enemy, element's time ends here
    if (data.through === false) {
      element.time = 0
    }
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
        this.affectActor(actor, element)
      }
    })

    if (element.time === 0) {
      this.onEvent({ type: RoomEventType.SpellEnd, x: element.x, y: element.y, spell: element.type, from: element.from, amount: element.damaged.length })
    }
  }

  updateActor = (actor:Actor) => {
    actor.bd.stateTime--
    if (actor.bd.stateTime > 0) return

    if (actor.bd.state == ActorState.Spell) {
      actor.bd.state = ActorState.Wait
    }

    if (actor.bd.state === ActorState.PreSpell) {
      this.doSpell(actor)
    }

    const opponents = actor.bd.isPlayer ? this.getEnemies() : this.getPlayers()
    const teammmates = actor.bd.isPlayer ? this.getPlayers() : this.getEnemies()

    // if we're an enemy and there's no opponents, we don't do anything
    if (!opponents.length && !actor.bd.isPlayer) return

    // if we arent waiting, we should return
    if (actor.bd.state !== ActorState.Wait) return

    let didSelected = false
    // leave if we have no opponents
    if (actor.behavior === Behavior.Evade || opponents.length === 0) {
      didSelected = this.tryEvade(actor)
    } else if (actor.behavior === Behavior.Aggro) {
      didSelected = this.tryAggro(actor, opponents)
    } else if (actor.behavior === Behavior.Help) {
      didSelected = this.tryHelp(actor, teammmates)
    }

    if (!didSelected) {
      if (actor.behavior === Behavior.Help) {
        // if (teammmates.length > 1) {
        //   console.log('special case, trying to evade')
        //   this.tryEvade(actor)
        // } else {
          console.log('special case, trying to attack')
          this.tryAggro(actor, opponents)
        // }
      }
    }
  }

  tryAggro = (actor:Actor, opponents:Actor[]):boolean => {
    const nearest = findNearest(actor.bd.x, actor.bd.y, opponents)
    if (!nearest) {
      // leave if there's noone to fight
      this.tryMoveActor(actor, this.exit.x, this.exit.y)
      return true
    }

    const spell = getActorSpellData(actor, Behavior.Aggro)
    if (actor.bd.mana - spell.mana < 0) {
      return false
    }

    const nearestDist = distanceBetween(actor.bd.x, actor.bd.y, nearest.bd.x, nearest.bd.y)

    // sqrt(2) is under 1.5
    if (nearestDist <= spell.range) {
      this.trySpell(actor, getActorSpell(actor, Behavior.Aggro), nearest.bd.x, nearest.bd.y)
    } else {
      this.tryMoveActor(actor, nearest.bd.x, nearest.bd.y)
    }
    return true
  }

  tryHelp = (actor:Actor, teammmates:Actor[]):boolean => {
    const spell = getActorSpell(actor, Behavior.Help)
    const helpTeammates = teammmates.filter(t => needsHelp(t, spell))
    // TEMP: for now, do nothing (wait) if we have noone to heal
    // if (helpTeammates.length === 0/* && opponents.length === 0 */) {
    //   // exit if there's noone to help or heal
    //   this.tryMoveActor(actor, this.exit.x, this.exit.y)
    //   return true
    // }

    const nearest = findNearest(actor.bd.x, actor.bd.y, helpTeammates)
    if (!nearest) {
      // TODO: attack if we cant heal?
      console.log('No one to heal, doing nothing')
      return true
    }

    const spellData = getActorSpellData(actor, Behavior.Help)
    if (actor.bd.mana - spellData.mana < 0) {
      return false
    }

    const nearestDist = distanceBetween(actor.bd.x, actor.bd.y, nearest.bd.x, nearest.bd.y)

    // sqrt(2) is under 1.5
    if (nearestDist <= spellData.range) {
      this.trySpell(actor, spell, nearest.bd.x, nearest.bd.y)
    } else {
      this.tryMoveActor(actor, nearest.bd.x, nearest.bd.y)
    }
    return true
  }

  tryEvade = (actor:Actor):boolean => {
    this.tryMoveActor(actor, this.exit.x, this.exit.y)
    return true
  }

  addElement (actor:Actor, spell:SpellType) {
    const sData = spellData.get(spell)!

    const ranged = sData.range > FSQRT2
    const path = ranged ? makeLine(actor.bd.x, actor.bd.y, actor.bd.spellPos!.x, actor.bd.spellPos!.y) : []

    // first is actually second, because we get rid of the first
    if (ranged) {
      // try: ranged = path.shift()
      const zeroth = path.shift()
      // console.log(zeroth!.x === actor.bd.x && zeroth!.y === actor.bd.y)
    }
    const first = path.shift()

    const startX = ranged ? first!.x : actor.bd.spellPos!.x
    const startY = ranged ? first!.y : actor.bd.spellPos!.y

    this.elements.push({
      type: spell,
      x: startX,
      y: startY,
      path,
      damaged: [],
      time: sData.time,
      from: actor
    })
  }

  trySpell (actor:Actor, spell:SpellType, x:number, y:number) {
    actor.bd.spellPos = vec2(x, y)
    actor.bd.state = ActorState.PreSpell
    actor.bd.spell = spell
    actor.bd.stateTime = 30 // lookup from spell
  }

  doSpell (actor:Actor) {
    if (!actor.bd.spellPos) throw 'No Spell Pos!'
    // console.log('actor spell', spell, spell === SpellType.Heal)
    const spell = actor.bd.spell!
    this.addElement(actor, spell)
    this.onEvent({ type: RoomEventType.Spell, spell, from: actor, x: actor.bd.spellPos.x, y: actor.bd.spellPos.y })
    actor.bd.spellPos = undefined
    actor.bd.mana -= spellData.get(spell)!.mana
    actor.bd.state = ActorState.Spell
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

    const isDiagonal = actor.bd.x !== items[0].x && actor.bd.y !== items[0].y

    actor.bd.x = items[0].x
    actor.bd.y = items[0].y

    // const time = Math.floor((256 - actor.bd.stats.Speed) / 10)
    const time = Math.floor(348 / actor.bd.stats.Speed)
    actor.bd.stateTime = isDiagonal ? time * Math.SQRT2 : time
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
