import { SpellType } from './spell-data'

export enum ActorType {
  Knight = 'Knight',
  Goblin = 'Goblin',
}

export enum Behavior {
  Aggro = 'Aggro',
  Heal = 'Heal',
  Evade = 'Evade',
}

// TODO: split up actor type
export type ActorData = {
  tile:number
  offSpell:SpellType
  behaviors:Behavior[]
  defSpell?:SpellType
}

export const actorData:Map<ActorType, ActorData> = new Map()

actorData.set(ActorType.Knight, { tile: 0, offSpell: SpellType.Cut, behaviors: [Behavior.Aggro, Behavior.Evade] })
actorData.set(ActorType.Goblin, { tile: 32, offSpell: SpellType.Fire, behaviors: [Behavior.Aggro] })

const playerActors = [ActorType.Knight]
export const isPlayerActor = (actorType:ActorType) =>
  playerActors.includes(actorType)
