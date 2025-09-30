import { Actor } from '../world/actor'
import { actorData, Behavior } from './actor-data'

export const FSQRT2 = 1.5 // not SQRT2 but the real square root of 2 will be under this
const MAXDIST = 25.0 // for now

export enum SpellType {
  Slice,
  Stab,
  // Cut,
  Arrow,
  Fire,
  Heal
}

export type SpellData = {
  time:number
  range:number
  tile:number
  damage:number
  through?:boolean
}

export const spellData:Map<SpellType, SpellData> = new Map()

spellData.set(SpellType.Slice, { time: 1, range: FSQRT2, damage: 20, tile: 256 })
spellData.set(SpellType.Stab, { time: 1, range: FSQRT2, damage: 8, tile: 257 })
spellData.set(SpellType.Arrow, { time: 10, range: 5, damage: 5, tile: 258, through: false })
spellData.set(SpellType.Fire, { time: 10, range: MAXDIST, damage: 10, tile: 259, through: true })
spellData.set(SpellType.Heal, { time: 1, range: FSQRT2, damage: -20, tile: 261 })

export const getActorSpellData = (actor:Actor):SpellData =>
  spellData.get(getActorSpell(actor))!

// just aggro and help for now
export const getActorSpell = (actor:Actor):SpellType =>
  actor.behavior === Behavior.Aggro ? actorData.get(actor.type)!.aggroSpell : actorData.get(actor.type)!.helpSpell!

// export const isMagic = (type:SpellType) => spellData.get(type).mana > 0
// TEMP:
export const isMagic = (type:SpellType) => spellData.get(type)!.range === MAXDIST
