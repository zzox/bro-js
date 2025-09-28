import { actorData } from '../data/actor-data'
import { Actor } from '../world/actor'
import { $q } from './ui'

const MAX_ACTORS = 6
let actorUis:PlayerUi[] = []

type PlayerUi = {
  item:Element
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
      item,
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
  actorUis.forEach((aui, i) => {
    if (!actors[i]) {
      aui.item.classList.add('display-none')
      return
    } else {
      aui.item.classList.remove('display-none')
    }
    aui.hpBar.value = actors[i].health
    aui.hpBar.max = actors[i].maxHealth
    // move out to method when the elements are removed
    aui.name.textContent = actors[i].name
    // setImage(actorData.get(aui.type)!.tile)

    // TEST: clear and then sometimes add, probably will be the model going forwards
    // aui.buttons.forEach(btn => btn.classList.remove('display-none'))
    // aui.buttons.forEach(btn => Math.random() < 0.5 ? btn.classList.add('display-none') : null)
  })
}
