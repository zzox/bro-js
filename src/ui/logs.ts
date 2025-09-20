import { $make, $q, $span } from './ui'

const logs = $q('#logs')

export const addLog = (html:String) => {
  const log = $make('p')
  log.innerHTML = `${$span('char1', 'WHITE')} did ${$span('8', 'RED')} damage to CharName`
  logs.appendChild(log)
}
