import { names } from '../data/names'

type BattleData = {
  state:ActorState
  stateTime:number
  x:number
  y:number
  isPlayer:boolean
}

export enum Behavior {
  Aggro,
  Evade
}

export enum ActorState {
  Wait, // move
  PreAttack,
  Attack,
}

export class Actor {
  name:string
  behavior:Behavior = Behavior.Aggro

  health:number
  maxHealth:number

  battleData!:BattleData

  constructor () {
    this.health = 75
    this.maxHealth = 100

    // this.battleData = {}
    this.name = names[Math.floor(Math.random() * names.length)]
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
