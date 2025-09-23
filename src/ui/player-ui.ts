import { Actor } from '../world/actor'
import { $q } from './ui'

const MAX_ACTORS = 6
const actorUis = Array.from(document.querySelectorAll('.char'))

/*
export const setActorCallback = (cb:(num:number, behavior:Behavior) => void) => {

}
*/

export const updatePlayerUi = (actors:Actor[]) => {
  actors.forEach((actor, i) => {
    // console.log(actorUis[i], i)
    ;(actorUis[i].querySelector('.hp-bar') as HTMLProgressElement).value = actor.health
    ;(actorUis[i].querySelector('.hp-bar') as HTMLProgressElement).max = actor.maxHealth
  })
}
