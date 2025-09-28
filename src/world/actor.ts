import { ActorType, Behavior, isPlayerActor } from '../data/actor-data'
import { Vec2 } from '../data/globals'
import { names } from '../data/names'
import { RElement } from './room'

type BattleData = {
  state:ActorState
  stateTime:number
  x:number
  y:number
  isPlayer:boolean
  // spell:Spell
  attackPos?:Vec2
}

export enum ActorState {
  Wait, // move
  PreAttack,
  Attack,
}

export class Actor {
  name:string
  type:ActorType
  behavior:Behavior = Behavior.Aggro

  health:number
  maxHealth:number

  battleData!:BattleData

  constructor (type:ActorType) {
    this.health = 75
    this.maxHealth = 100

    // this.battleData = {}
    this.name = isPlayerActor(type) ? names[Math.floor(Math.random() * names.length)] : `A ${type}`
    this.type = type
  }

  newBattle (x:number, y:number, isPlayer:boolean) {
    this.battleData = { x, y, state: ActorState.Wait, stateTime: 10, isPlayer }
  }

  get bd () {
    return this.battleData
  }

  get isAlive () {
    return this.health > 0
  }
}
