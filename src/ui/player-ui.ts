import { actorData } from '../data/actor-data'
import { Actor } from '../world/actor'
import { $q, $qAll } from './ui'

const MAX_ACTORS = 6
let actorUis:PlayerUi[] = []

type PlayerUi = {
  item:Element
  name:HTMLParagraphElement
  level:HTMLParagraphElement
  icon:HTMLDivElement
  hpBar:HTMLProgressElement
  mpBar:HTMLProgressElement
  // stepBar:HTMLProgressElement
  buttons:HTMLButtonElement[]
}

type BehaviorCallback = (actorNum:number, behaviorNum:number) => void

export const setupPlayerUi = (buttonCallback:BehaviorCallback) => {
  actorUis = Array.from(document.querySelectorAll('.char')).map((item, i) => {
    const buttons = Array.from(item.querySelectorAll('button'))

    const clearButtons = () => {
      buttons.forEach(btn => btn.classList.remove('selected'))
    }

    buttons.forEach((btn, j) => {
      btn.onclick = () => {
        buttonCallback(i, j)
        clearButtons()
        btn.classList.add('selected')
      }
      btn.querySelector('p')!.textContent = ['Aggro', 'Mixed', 'Evade'][j]
    })

    return {
      item,
      name: item.querySelector('.char-name')!,
      level: item.querySelector('.char-level')!,
      icon: item.querySelector('.ssimg')!,
      hpBar: item.querySelector('.hp-bar')!,
      mpBar: item.querySelector('.mp-bar')!,
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
  actorUis.forEach((aui, i) => {
    const actor = actors[i]
    if (!actor) {
      aui.item.classList.add('display-none')
      return
    } else {
      aui.item.classList.remove('display-none')
    }
    aui.hpBar.value = actor.health
    aui.hpBar.max = actor.maxHealth

    if (actor.maxMana === 0) {
      aui.mpBar.value = 1
      aui.mpBar.max = 1
    } else {
      aui.mpBar.value = actor.bd?.mana || actor.maxMana
      aui.mpBar.max = actor.maxMana
    }

    // move out to method when the elements are removed
    aui.name.textContent = actor.name
    aui.level.textContent = `lvl ${actor.level}`

    if (!actor.isAlive) {
      setImage(aui.icon, 384)
    } else if (actor.bd.left) {
      setImage(aui.icon, 385)
    } else {
      setImage(aui.icon, actorData.get(actor.type)!.tile)
    }

    aui.buttons.forEach((btn, j) => {
      const behavior = actorData.get(actor.type)!.behaviors[j]
      // console.log(btn.textContent, j, behavior)
      if (behavior) {
        btn.classList.remove('display-none')
        btn.children[0].textContent = behavior
        actor.behavior === behavior ? btn.classList.add('selected') : btn.classList.remove('selected')
      } else {
        btn.classList.add('display-none')
      }
    })
  })
}

export const setBehaviorButtons = (enabled:boolean) => {
  ($qAll('.char-button') as HTMLButtonElement[]).forEach(btn => btn.disabled = !enabled)
}
