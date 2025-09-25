import { logger } from '../util/logger'
import { RoomEvent, RoomEventType } from '../world/room'
import { $make, $q, $span } from './ui'

const logs = $q('#logs')

const addLog = (html:string) => {
  const log = $make('p')
  log.innerHTML = html
  logs.appendChild(log)
}

export const createLogFromEvent = (event:RoomEvent) => {
  let string = ''

  switch (event.type) {
    case RoomEventType.Damage:
      string = `${$span(event.from!.name, 'WHITESMOKE')} did ${$span(event.amount! + '', 'RED')} damage to ${$span(event.to!.name, 'WHITESMOKE')}`
      break
    case RoomEventType.Death:
      string = `${$span(event.to!.name, 'WHITESMOKE')} died`
      break
    case RoomEventType.Leave:
      string = `${$span(event.from!.name, 'WHITESMOKE')} left`
      break
    case RoomEventType.AttackEnd:
      if (event.amount === 0) {
        string = `${$span(event.from!.name, 'WHITESMOKE')} missed`
      }
    default:
      logger.info('no log handler for event:', event.type)
      return
  }

  addLog(string)
}
