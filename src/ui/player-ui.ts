import { actorData } from '../data/actor-data'
import { Actor } from '../world/actor'
import { $q } from './ui'

const MAX_ACTORS = 6
let actorUis:PlayerUi[] = []

type PlayerUi = {
  name:HTMLParagraphElement
  icon:HTMLDivElement
  hpBar:HTMLProgressElement
  stepBar:HTMLProgressElement
  buttons:HTMLButtonElement[]
}

type BehaviorCallback = (actorNum:number, behaviorNum:number) => void

export const setupPlayerUi = (buttonCallback:BehaviorCallback) => {
  actorUis = Array.from(document.querySelectorAll('.char')).map((item, i) => {
    const buttons = Array.from(item.querySelectorAll('button'))

    buttons.forEach((btn, j) => {
      btn.onclick = () => {
        buttonCallback(i, j)
      }
      btn.querySelector('p')!.textContent = ['Aggro', 'Mixed', 'Evade'][j]
    })

    return {
      name: item.querySelector('.char-name')!,
      icon: item.querySelector('.ssimg')!,
      hpBar: item.querySelector('.hp-bar')!,
      stepBar: item.querySelector('.step-bar')!,
      buttons
    }
  })
}

/*
export const setActorCallback = (cb:(num:number, behavior:Behavior) => void) => {

}
*/

const setImage = (icon:HTMLDivElement, tile:number) => {
  const scale = 2
  const imgWidth = 384
  const sx = tile * 12 % imgWidth
  const sy = Math.floor(tile * 12 / imgWidth) * 12
  icon.style.backgroundPosition = `-${sx * scale}px -${sy * scale}px`
}

export const updatePlayerUi = (actors:Actor[]) => {
  actorUis.forEach((actor, i) => {
    actor.hpBar.value = actors[i].health
    actor.hpBar.max = actors[i].maxHealth
    // move out to method when the elements are removed
    actor.name.textContent = actors[i].name
    // setImage(actorData.get(actor.type)!.tile)
  })
}
