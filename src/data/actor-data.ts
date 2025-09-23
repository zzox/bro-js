import { SpellType } from "./spell-data"

enum ActorType {
  Knight,
  Goblin
}

type ActorData = {
  offSpell?:SpellType
  defSpell?:SpellType
}

export const actorData:Map<ActorType, ActorData> = new Map()

actorData.set(ActorType.Knight, { offSpell: SpellType.Cut })
actorData.set(ActorType.Goblin, { offSpell: SpellType.Fire })
