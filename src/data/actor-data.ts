import { SpellType } from './spell-data'

export enum ActorType {
  Knight = 'Knight',
  Archer = 'Archer',
  Mage = 'Mage',
  // Enemies
  Goblin = 'Goblin',
}

export enum Behavior {
  Aggro = 'Aggro',
  Help = 'Help',
  Evade = 'Evade',
}

// TODO: split up actor type
export type ActorData = {
  tile:number
  aggroSpell:SpellType
  behaviors:Behavior[]
  helpSpell?:SpellType
}

export const actorData:Map<ActorType, ActorData> = new Map()

actorData.set(ActorType.Knight, { tile: 0, aggroSpell: SpellType.Slice, behaviors: [Behavior.Aggro] })
actorData.set(ActorType.Archer, { tile: 1, aggroSpell: SpellType.Arrow, helpSpell: SpellType.Heal, behaviors: [Behavior.Aggro, Behavior.Help, Behavior.Evade] })
actorData.set(ActorType.Mage, { tile: 2, aggroSpell: SpellType.Stab, helpSpell: SpellType.Heal, behaviors: [Behavior.Aggro, Behavior.Help, Behavior.Evade] })
actorData.set(ActorType.Goblin, { tile: 32, aggroSpell: SpellType.Fire, behaviors: [Behavior.Aggro] })

const playerActors = [ActorType.Knight]
export const isPlayerActor = (actorType:ActorType) =>
  playerActors.includes(actorType)
