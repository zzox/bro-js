import { SpellType } from './spell-data'

export enum ActorType {
  Knight = 'Knight',
  Goblin = 'Goblin',
}

type ActorData = {
  tile:number
  offSpell:SpellType
  defSpell?:SpellType
}

export const actorData:Map<ActorType, ActorData> = new Map()

actorData.set(ActorType.Knight, { tile: 0, offSpell: SpellType.Cut })
actorData.set(ActorType.Goblin, { tile: 32, offSpell: SpellType.Fire })

const playerActors = [ActorType.Knight]
export const isPlayerActor = (actorType:ActorType) =>
  playerActors.includes(actorType)
