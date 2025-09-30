import { actorData, ActorType, Behavior, CompStats, getStatsFromLevel, isPlayerActor } from '../data/actor-data'
import { Vec2 } from '../data/globals'
import { names } from '../data/names'

type BattleData = {
  state:ActorState
  stateTime:number
  x:number
  y:number
  isPlayer:boolean
  // spell:Spell
  spellPos?:Vec2
  stats:CompStats
  exp:number
}

export enum ActorState {
  Wait, // move
  PreSpell,
  Spell,
}

export class Actor {
  name:string
  type:ActorType
  behavior:Behavior = Behavior.Aggro

  health:number
  maxHealth:number
  level:number = 10
  experience:number = 1000

  battleData!:BattleData

  constructor (type:ActorType) {
    this.health = 100
    this.maxHealth = 100

    // this.battleData = {}
    this.name = isPlayerActor(type) ? names[Math.floor(Math.random() * names.length)] : `A ${type}`
    this.type = type
  }

  newBattle (x:number, y:number, isPlayer:boolean) {
    this.battleData = {
      x, y, state: ActorState.Wait, stateTime: 10, isPlayer, exp: 0,
      stats: getStatsFromLevel(this.level, actorData.get(this.type)!.stats)
    }
  }

  get bd () {
    return this.battleData
  }

  get isAlive () {
    return this.health > 0
  }
}
