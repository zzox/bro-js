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

type ExpSpeed = number[]

const low01 = [0, 1]
const low02 = [0, 1, 1]
const low10 = [0, 1, 1, 2]
const low12 = [1, 2]
const low20 = [1, 2, 2, 3]
const low03 = [0, 1, 2, 3]
const low035 = [0, 1, 2, 3, 5]
const low35 = [1, 2, 3, 5]
const low04 = [1, 1, 2, 3, 3]
const low05 = [2, 3, 3, 7]

enum StatType {
  MaxHealth,
  Speed,
  Power,
  Int,
  Dex,
}

// type Stat = [StatType, ExpSpeed]
type Stats = {
  [StatType.MaxHealth]: ExpSpeed
  [StatType.Speed]: ExpSpeed
  [StatType.Power]: ExpSpeed
  [StatType.Int]: ExpSpeed
  [StatType.Dex]: ExpSpeed
}

// TODO: split up actor type
export type ActorData = {
  tile:number
  aggroSpell:SpellType
  helpSpell?:SpellType
  behaviors:Behavior[]
  baseHealth:number
  stats:Stats
}

export const actorData:Map<ActorType, ActorData> = new Map()

actorData.set(ActorType.Knight, { tile: 0, aggroSpell: SpellType.Slice,
  behaviors: [Behavior.Aggro],
  baseHealth: 100,
  stats: {
    [StatType.MaxHealth]: low05,
    [StatType.Speed]: low12,
    [StatType.Power]: low35,
    [StatType.Int]: low01,
    [StatType.Dex]: low01,
  }
})
actorData.set(ActorType.Archer, { tile: 1, aggroSpell: SpellType.Arrow, helpSpell: SpellType.Heal,
  behaviors: [Behavior.Aggro, Behavior.Help, Behavior.Evade],
  baseHealth: 75,
  stats: {
    [StatType.MaxHealth]: low04,
    [StatType.Speed]: low04,
    [StatType.Power]: low12,
    [StatType.Int]: low20,
    [StatType.Dex]: low10
  }
})
actorData.set(ActorType.Mage, { tile: 2, aggroSpell: SpellType.Stab, helpSpell: SpellType.Heal,
  behaviors: [Behavior.Aggro, Behavior.Help, Behavior.Evade],
  baseHealth: 50,
  stats: {
    [StatType.MaxHealth]: low02,
    [StatType.Speed]: low10,
    [StatType.Power]: low01,
    [StatType.Int]: low35,
    [StatType.Dex]: low35
  }
})
actorData.set(ActorType.Goblin, { tile: 32, aggroSpell: SpellType.Fire,
  behaviors: [Behavior.Aggro],
  baseHealth: 50,
  stats: {
    [StatType.MaxHealth]: low20,
    [StatType.Speed]: low35,
    [StatType.Power]: low12,
    [StatType.Int]: low10,
    [StatType.Dex]: low12
  }
})

const playerActors = [ActorType.Knight, ActorType.Archer, ActorType.Mage]
export const isPlayerActor = (actorType:ActorType) =>
  playerActors.includes(actorType)

export const getLevelFromExperience = (exp:number) => {
  Math.floor(Math.pow(exp, 1/3))
}
