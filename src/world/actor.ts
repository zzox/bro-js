import { names } from '../data/names'

type BattleData = {
  stateTime:number
  x:number
  y:number
  isPlayer:boolean
}

export class Actor {
  name:string

  health:number
  maxHealth:number

  battleData!:BattleData

  constructor () {
    this.health = 75
    this.maxHealth = 100

    // this.battleData = {}
    this.name = names[Math.floor(Math.random() * names.length)]
  }

  get bd () {
    return this.battleData
  }

  get isAlive () {
    return this.health > 0
  }
}
