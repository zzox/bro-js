import { Actor } from '../world/actor'
import { actorData } from './actor-data'

export const SQRT2 = 1.5 // not actually, but the real sqare root of 2 will be under this
const MAXDIST = 25.0 // for now

export enum SpellType {
  Cut,
  // Slice,
  Fire
}

export type SpellData = {
  time:number
  range:number
}

export const spellData:Map<SpellType, SpellData> = new Map();

spellData.set(SpellType.Cut, { time: 1, range: SQRT2, })
spellData.set(SpellType.Fire, { time: 10, range: MAXDIST })

export const getActorSpellData = (actor:Actor):SpellData => {
  return spellData.get(actorData.get(actor.type)!.offSpell)!
}
