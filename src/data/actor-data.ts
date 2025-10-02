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

type ExpInc = number[]
// names are based on their averages
const zero = [0]
const low05 = [0, 1]
const low06 = [0, 1, 1] // 0.66
const low10 = [0, 1, 1, 2]
const low15 = [1, 2]
const mid15 = [0, 1, 2, 3]
const low20 = [1, 2, 2, 3]
const mid20 = [1, 1, 2, 3, 3]
const low22 = [0, 1, 2, 3, 5]
const low27 = [1, 2, 3, 5]
const low37 = [2, 3, 3, 7]

const low50 = [4, 5, 6]
const low60 = [5, 6, 7]
const low70 = [6, 6, 7, 8, 8]

enum StatType {
  MaxHealth = 'MaxHealth',
  MaxMana = 'MaxMana',
  Speed = 'Speed',
  Power = 'Power',
  Int = 'Int',
  Dex = 'Dex',
}

// type Stat = [StatType, ExpInc]
type Stats = {
  [StatType.MaxHealth]: ExpInc
  [StatType.MaxMana]: ExpInc
  [StatType.Speed]: ExpInc
  [StatType.Power]: ExpInc
  [StatType.Int]: ExpInc
  [StatType.Dex]: ExpInc
}

export type CompStats = {
  [StatType.MaxHealth]: number
  [StatType.MaxMana]: number
  [StatType.Speed]: number
  [StatType.Power]: number
  [StatType.Int]: number
  [StatType.Dex]: number
}

// TODO: split up actor type
export type ActorData = {
  tile:number
  aggroSpell:SpellType
  helpSpell?:SpellType
  behaviors:Behavior[]
  baseHealth:number
  baseMana:number
  stats:Stats
}

export const actorData:Map<ActorType, ActorData> = new Map()

actorData.set(ActorType.Knight, { tile: 0, aggroSpell: SpellType.Slice,
  behaviors: [Behavior.Aggro],
  baseHealth: 100,
  baseMana: 0,
  stats: {
    [StatType.MaxHealth]: low37,
    [StatType.MaxMana]: zero,
    [StatType.Speed]: low15,
    [StatType.Power]: low27,
    [StatType.Int]: zero,
    [StatType.Dex]: zero,
  }
})
actorData.set(ActorType.Archer, { tile: 1, aggroSpell: SpellType.Arrow, helpSpell: SpellType.Heal,
  behaviors: [Behavior.Aggro, Behavior.Help, Behavior.Evade],
  baseHealth: 75,
  baseMana: 20,
  stats: {
    [StatType.MaxHealth]: mid20,
    [StatType.MaxMana]: low10,
    [StatType.Speed]: mid20,
    [StatType.Power]: low15,
    [StatType.Int]: low20,
    [StatType.Dex]: low10
  }
})
actorData.set(ActorType.Mage, { tile: 2, aggroSpell: SpellType.Stab, helpSpell: SpellType.Heal,
  behaviors: [Behavior.Aggro, Behavior.Help, Behavior.Evade],
  baseHealth: 50,
  baseMana: 30,
  stats: {
    [StatType.MaxHealth]: low15,
    [StatType.MaxMana]: low37,
    [StatType.Speed]: low10,
    [StatType.Power]: low05,
    [StatType.Int]: low27,
    [StatType.Dex]: low27
  }
})
actorData.set(ActorType.Goblin, { tile: 32, aggroSpell: SpellType.Fire,
  behaviors: [Behavior.Aggro],
  baseHealth: 50,
  baseMana: 0,
  stats: {
    [StatType.MaxHealth]: low50,
    [StatType.MaxMana]: zero,
    [StatType.Speed]: low27,
    [StatType.Power]: low15,
    [StatType.Int]: low10,
    [StatType.Dex]: low15
  }
})

const playerActors = [ActorType.Knight, ActorType.Archer, ActorType.Mage]
export const isPlayerActor = (actorType:ActorType) =>
  playerActors.includes(actorType)

export const getLevelFromExp = (exp:number) =>
  Math.floor(Math.pow(exp, 1/3))

export const getExpFromLevel = (level:number) =>
  Math.pow(level, 3)

export const getStatsFromLevel = (level:number, stats:Stats):CompStats => {
  const comp:CompStats = {
    [StatType.MaxHealth]: 0,
    [StatType.MaxMana]: 0,
    [StatType.Speed]: 0,
    [StatType.Power]: 0,
    [StatType.Int]: 0,
    [StatType.Dex]: 0,
  }

  while (--level > 0) {
    for (let key in comp) {
      // @ts-ignore
      comp[key] += stats[key][level % stats[key].length]
    }
  }

  return comp
}

export const getExpGainFromStats = (stats:CompStats) =>
  2 * (stats[StatType.MaxHealth] + stats[StatType.Speed] + stats[StatType.Power] + stats[StatType.Int] + stats[StatType.Dex])
