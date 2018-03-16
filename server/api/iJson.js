import ServiceManager from '../services/SvcManager'
import express from 'express'
import path from 'path'

module.exports = function() {
  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  const router = express.Router()

  /////////////////////////////////////////////////////////////////////////////
  // POST /igml/:filename
  // Post IndoorGML file
  //
  /////////////////////////////////////////////////////////////////////////////

  router.post('/', async (req, res) => {
    try {
      var payload = req.body

      var socketSvc = ServiceManager.getService(
              'SocketSvc')
              
      socketSvc.broadcast( 'ijson.response', payload )

      res.json();

    } catch (ex) {
      res.status(ex.statusCode || 500)
      res.json(ex)
    }
  })

  return router
}
