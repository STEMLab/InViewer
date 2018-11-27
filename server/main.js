import express from 'express'
import path from 'path'
import webpack from 'webpack'
import logger from '../build/lib/logger'
import webpackConfig from '../build/webpack.config'
import project from '../project.config'
import compress from 'compression'
import session from 'express-session'
import bodyParser from 'body-parser'
import cors from 'cors'

import IGMLAPI from './api/iGml'
import IJSONAPI from './api/iJson'

//Services
import ServiceManager from './services/SvcManager'
import UploadSvc from './services/UploadSvc'
import SocketSvc from './services/SocketSvc'

const app = express()
app.use(compress())

// ------------------------------------
// Apply Webpack HMR Middleware
// ------------------------------------
if (project.env === 'development') {
  const compiler = webpack(webpackConfig)

  app.use(cors());

  logger.info('Enabling webpack development and HMR middleware')
  app.use(require('webpack-dev-middleware')(compiler, {
    publicPath  : webpackConfig.output.publicPath,
    contentBase : path.resolve(project.basePath, project.srcDir),
    hot         : true,
    quiet       : false,
    noInfo      : false,
    lazy        : false,
    stats       : 'normal',
  }))
  app.use(require('webpack-hot-middleware')(compiler, {
    path: '/__webpack_hmr'
  }))

  // Serve static assets from ~/public since Webpack is unaware of
  // these files. This middleware doesn't need to be enabled outside
  // of development since this directory will be copied into ~/dist
  // when the application is compiled.
  app.use(express.static(path.resolve(project.basePath, 'public')))

  app.use('/resources', express.static(__dirname + '/../resources'))

  // This rewrites all routes requests to the root /index.html file
  // (ignoring file requests). If you want to implement universal
  // rendering, you'll want to remove this middleware.
  /*
  app.use('*', function (req, res, next) {
    const filename = path.join(compiler.outputPath, 'index.html')
    compiler.outputFileSystem.readFile(filename, (err, result) => {
      if (err) {
        return next(err)
      }
      res.set('content-type', 'text/html')
      res.send(result)
      res.end()
    })
  })
} else {
  logger.warn(
    'Server is being run outside of live development mode, meaning it will ' +
    'only serve the compiled application bundle in ~/dist. Generally you ' +
    'do not need an application server for this and can instead use a web ' +
    'server such as nginx to serve your static files. See the "deployment" ' +
    'section in the README for more information on deployment strategies.'
  )
*/
  // Serving ~/dist by default. Ideally these files should be served by
  // the web server and not the app server, but this helps to demo the
  // server in production.
  app.use(express.static(path.resolve(project.basePath, project.outDir)))

  app.use('/resources', express.static(__dirname + '/../../resources'))
}

app.use(bodyParser.urlencoded({ extended: false }))

//app.use(bodyParser.json())
app.use(bodyParser.json({limit: '1gb'}));
app.use(bodyParser.raw({limit: '1gb' }));
app.use(bodyParser.text({limit: '1gb'}));

///////////////////////////////////////////////////////////
// Services setup
//
///////////////////////////////////////////////////////////
const uploadSvc = new UploadSvc({
  tempStorage: path.join(__dirname, '../TMP')
})
ServiceManager.registerService(uploadSvc)

/////////////////////////////////////////////////////////////////////
// API Routes setup
//
/////////////////////////////////////////////////////////////////////
app.use('/api/igml',    IGMLAPI())
app.use('/api/ijson',   IJSONAPI())

/////////////////////////////////////////////////////////////////////
// Server Configuration
//
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
//
//
/////////////////////////////////////////////////////////////////////
const runServer = () => {

  try {

    process.on('exit', () => {

    })

    process.on('uncaughtException', (err) => {

      console.log('uncaughtException')
      console.log(err)
      console.error(err.stack)
    })

    process.on('unhandledRejection', (reason, p) => {

      console.log('Unhandled Rejection at: Promise ', p,
        ' reason: ', reason)
    })

    const server = app.listen(
      process.env.PORT || 3000, () => {

        const socketSvc = new SocketSvc({
          session,
          server
        })

        ServiceManager.registerService(socketSvc)

        const port = server.address().port

        console.log('Server listening on PORT: ' + port)
        console.log('ENV: ' + process.env.NODE_ENV)
      })

  } catch (ex) {

    console.log('Failed to run server... ')
    console.log(ex)
  }
}

module.exports = runServer
