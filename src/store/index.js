import createStore from './createStore'

//Services
import ServiceManager from 'SvcManager'
import NotifySvc from 'NotifySvc'
import DialogSvc from 'DialogSvc'
import EventSvc from 'EventSvc'
import SocketSvc from 'SocketSvc'

// ========================================================
// Services Initialization
// ========================================================
const notifySvc = new NotifySvc()
const dialogSvc = new DialogSvc()
const eventSvc = new EventSvc()

const socketSvc = new SocketSvc({
  host: "127.0.0.1",
  port: "3000"
})

ServiceManager.registerService(dialogSvc)
ServiceManager.registerService(notifySvc)
ServiceManager.registerService(eventSvc)
ServiceManager.registerService(socketSvc)

// ========================================================
// Store Instantiation
// ========================================================
const initialState = window.___INITIAL_STATE__

const store = createStore(initialState)

export default store
