import { Actor } from '../world/actor'
import { actorData } from './actor-data'

export const SQRT2 = 1.5 // not actually, but the real sqare root of 2 will be under this
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
  through?:boolean
}

export const spellData:Map<SpellType, SpellData> = new Map()

spellData.set(SpellType.Slice, { time: 1, range: SQRT2, tile: 256 })
spellData.set(SpellType.Stab, { time: 1, range: SQRT2, tile: 257 })
spellData.set(SpellType.Arrow, { time: 10, range: MAXDIST, tile: 258, through: false })
spellData.set(SpellType.Fire, { time: 10, range: MAXDIST, tile: 259, through: true })
spellData.set(SpellType.Heal, { time: 1, range: SQRT2, tile: 261, through: true })

export const getActorSpellData = (actor:Actor):SpellData => {
  return spellData.get(actorData.get(actor.type)!.aggroSpell)!
}
