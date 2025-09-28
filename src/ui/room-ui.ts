import { $q } from './ui'

const button = $q('.battle-buttons > button') as HTMLButtonElement

export const setupBattleUi = (uiCallback:() => void) => {
  button.onclick = uiCallback
}

export const setBattleUi = (enabled:boolean) => {
  button.disabled = !enabled
}
