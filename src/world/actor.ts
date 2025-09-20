import { names } from "../data/names"

type BattleData = {}

export class Actor {

  name:string

  health:number

  battleData!:BattleData

  constructor () {
    this.health = 0

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
