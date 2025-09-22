import { vec2, Vec2 } from "../data/globals";

// create new vec2s for ones that will be reused
export const recycle = (vecs:Vec2[]):Vec2[] => vecs.map(v => vec2(v.x, v.y))
