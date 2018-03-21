import EventsEmitter from 'EventsEmitter'

export default class ViewerExtensionBase extends EventsEmitter {
  /////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////
  constructor (viewer, options = {}, defaultOptions = {}) {

    super (viewer)

    // bindings

    this.defaultOptions = defaultOptions

    this.options = Object.assign({},
      defaultOptions,
      options)

    this.viewer = viewer

    this.initializeEvents ()
  }

  initializeEvents () {
    if (this.options.events) {
      this.events = this.options.events

      // register options

      this.viewerEvents = []

      this.viewerEvents.forEach((event) => {

        this.viewerEvent(event.id, this[event.handler])
      })
    }

    viewerEvent (eventId, handler) {
      if (handler) {
        this.viewer.addEventListener (eventId, handler)
        return
      }

      const eventIds = Array.isArray(eventId)
        ? eventId : [eventId]

      const eventTasks = eventIds.map((id) => {
        return new Promise ((resolve) => {
          const __handler = (args) => {
            this.viewer.removeEventListener (id, __handler)
            resolve (args)
          }
          this.viewer.addEventListener (id, __handler)
        })
      })

      return Promise.all (eventsTaks)
    }
  }

  /////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////
  static get ExtensionId() {
    return 'Viewer.ExtensionBase'
  }

  /////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////
  load () {
    return true
  }

  /////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////
  unload () {

    this.viewerEvents.forEach((event) => {

      this.viewer.removeEventListener(
        event.id, this[event.handler])
    })

    if (this.events) {

      // unregister events
    }

    this.off()

    return true
  }

  /////////////////////////////////////////////////////////
  // Reload callback, in case the extension is re-loaded
  // more than once
  //
  /////////////////////////////////////////////////////////
  reload (options = {}) {

    this.options = Object.assign({},
      this.defaultOptions,
      this.options,
      options)

    return true
  }

}
