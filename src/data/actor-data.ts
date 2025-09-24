import { SpellType } from "./spell-data"

export enum ActorType {
  Knight,
  Goblin
}

type ActorData = {
  tile:number
  offSpell?:SpellType
  defSpell?:SpellType
}

export const actorData:Map<ActorType, ActorData> = new Map()

actorData.set(ActorType.Knight, { tile: 1, offSpell: SpellType.Cut })
actorData.set(ActorType.Goblin, { tile: 32, offSpell: SpellType.Fire })
