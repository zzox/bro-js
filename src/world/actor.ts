import { actorData, ActorType, Behavior, CompStats, getStatsFromLevel, isPlayerActor } from '../data/actor-data'
import { Vec2 } from '../data/globals'
import { names } from '../data/names'
import { SpellType } from '../data/spell-data'

type BattleData = {
  state:ActorState
  stateTime:number
  x:number
  y:number
  isPlayer:boolean
  left:boolean
  spell?:SpellType
  spellPos?:Vec2
  damagedBy:Actor[]
  healedBy:Actor[]
  stats:CompStats
  mana:number
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
  maxMana:number
  level:number = 10
  experience:number = 1000

  battleData!:BattleData

  constructor (type:ActorType) {
    // this.battleData = {}
    this.name = isPlayerActor(type) ? names[Math.floor(Math.random() * names.length)] : `A ${type}`
    this.type = type

    const stats = getStatsFromLevel(this.level, actorData.get(this.type)!.stats)

    this.maxHealth = actorData.get(type)!.baseHealth + stats.MaxHealth
    this.health = this.maxHealth
    this.maxMana = actorData.get(type)!.baseMana + stats.MaxMana
  }

  newBattle (x:number, y:number, isPlayer:boolean) {
    this.battleData = {
      x, y, state: ActorState.Wait, stateTime: 1, exp: 0, isPlayer, left: false,
      damagedBy: [], healedBy: [], mana: this.maxMana,
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
