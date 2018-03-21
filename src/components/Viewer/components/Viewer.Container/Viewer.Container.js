import React from 'react'
import ReactDOM from 'react-dom'

import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import PropTypes from 'prop-types'
import ServiceManager from 'SvcManager'
import BaseComponent from 'BaseComponent'
import './Viewer.Container.scss'
import ViewerApp from 'Viewer.App'
import Panel from 'Panel'

import ExtensionPane from 'ExtensionPane'

export default class ViewerContainer extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor(props, context) {

    super(props, context)

    this.notifySvc = ServiceManager.getService(
      'NotifySvc')

    this.eventSvc = ServiceManager.getService(
      'EventSvc')

    // Default states
    this.state = {
      dataExtension: null,
      viewerPanels: [],
      viewerFlex: 1.0,
      resizing: false,
      layout: {
        sidebar: {
          type: 'left'
        }
      },
      extensions : {
        data : []
      },
      renderExtensions : []
    }

    this.viewerFlex = 1.0
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async componentDidMount () {

    try {

      this.loader = new Loader(this.loaderContainer)

      const dbModel = await this.modelSvc.getModel(
        this.props.database,
        this.props.modelId)

      if (!this.props.appState.viewerEnv) {

        const viewerEnv = await this.initialize({
          useConsolidation: true,
          env: dbModel.env
        })

        this.props.setViewerEnv (viewerEnv)

        Autodesk.Viewing.Private.memoryOptimizedSvfLoading = true
      }

      this.assignState({
        dbModel
      })

      window.addEventListener(
        'resize', this.onStopResize)

      window.addEventListener(
        'resize', this.onResize)

    } catch (ex) {

      return this.props.onError(ex)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    window.removeEventListener(
      'resize', this.onStopResize)

    window.removeEventListener(
      'resize', this.onResize)
  }

  /////////////////////////////////////////////////////////
  // Initialize viewer environment
  //
  /////////////////////////////////////////////////////////
  initialize (options) {

    return new Promise((resolve, reject) => {

      /*
      Autodesk.Viewing.Initializer (options, () => {

        resolve ()

      }, (error) => {

        reject (error)
      })
      */
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onViewerStartResize = (e) => {

    this.assignState({
      resizing: true
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onViewerStopResize = (e) => {

    this.viewerFlex = e.component.props.flex

    /*
    if (this.state.renderExtension) {

      if (this.state.renderExtension.onStopResize) {

        this.state.renderExtension.onStopResize()
      }
    }
    */

    this.assignState({
      resizing: false
    })
  }

  onResize = (event) => {

    /*
    if (this.state.renderExtension) {

      if (this.state.renderExtension.onResize) {

        this.state.renderExtension.onResize()
      }
    }
    */

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onViewerCreated (viewer) {
    viewer.render();

    await this.setupExtensions (viewer)
  }


    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    loadDynamicExtension (viewer, extension, options) {

      return new Promise ((resolve, reject) => {

        var ext = viewer.getExtension(extension.id)

        if (ext) {
          if (ext.reload) {
            ext.reload(options)
          }
          return resolve (ext)
        }

        System.import(
          '../Viewer.Extensions/' +
          extension.id + '/index').then(() => {

          const extState = {
            [extension.id]: {}
          }

          this.assignState(extState).then(() => {

            viewer.loadExtension (
              extension.id, options).then((extInstance) => {

                this.eventSvc.emit('extension.loaded', {
                  extension: extInstance
                })

                return resolve (extInstance)

            }, (err) => {
              reject ('Failed to load extension: ' + extension.id)
            })
          })

        }, (error) => {

          reject (error)
        })
      })
    }

  setupExtensions(viewer) {
    const defaultOptions = {
      setMenubarState: this.props.setMenubarState,
      appContainer: ReactDOM.findDOMNode(this),
      model: null,
      location: this.props.location,
      appState: this.props.appState,
      notify: this.notifySvc,
      apiUrl: '/api'
    }

    const createDefaultOptions = (id) => {

      const fullDefaultOptions = Object.assign({},
        defaultOptions, {
          react: {
            pushRenderExtension:
              this.pushRenderExtension,

            popRenderExtension:
              this.popRenderExtension,

            forceUpdate: () => {

              return new Promise ((resolve) => {
                this.forceUpdate(() => {
                  resolve()
                })
              })
            },

            getComponent: () => {

              return this
            },
            getState: () => {

              return this.state[id] || {}
            },
            setState: (state, doMerge) => {

              return new Promise ((resolve) => {

                const extState = this.state[id] || {}

                const newExtState = {
                  [id]: doMerge
                    ? merge({}, extState, state)
                    : Object.assign({}, extState, state)
                }

                this.assignState(newExtState).then(() => {

                  resolve (newExtState)
                })
              })
            },
            props: this.props
          }
        })

      return fullDefaultOptions
    }


  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  pushRenderExtension (extension) {

    return new Promise (async(resolve) => {

      const layout = this.state.layout.sidebar.type

      this.viewerFlex = layout
        ? 1.0 - (layout.leftFlex || layout.rightFlex || 0.3)
        : 1.0

      await this.assignState({
        paneExtStyle: { display: 'block' }
      })

      await this.runAnimation (
        1.0, this.viewerFlex, 1.0)

      setTimeout(() => {

        this.assignState({
          renderExtension: extension
        }).then(() => {

          resolve ()
        })

      }, 250)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  popRenderExtension () {

    return new Promise ((resolve) => {

      this.assignState({
        renderExtension: null
      }).then(() => {
        resolve ()
      })

      setTimeout(async() => {

        await this.runAnimation(
          this.viewerFlex, 1.0, 1.0)

        await this.assignState({
          paneExtStyle: { display: 'none' }
        })

        resolve ()

      }, 250)
    })
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderViewer() {
    const {resizing} = this.state
    const viewerStyle = {
        pointerEvents: resizing
          ? 'none'
          : 'all'
    }
    return (
      <ViewerApp
        onViewerCreated={(viewer) => {
          this.onViewerCreated(viewer)
        }}
        style={viewerStyle}
      >
      </ViewerApp>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderExtension () {

    const { renderExtension } = this.state

    const renderOptions = {
      showTitle: true,
      docked: true
    }



    const content = renderExtension
      ? this.state.renderExtension.render(renderOptions)
      : <div></div>

    return (
      <div className="data-pane">
        { content }
      </div>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {
    const { layout, viewerFlex, paneExtStyle } = this.state

    const sidebar = layout.sidebar

    switch (sidebar ? sidebar.type : 'none') {
      case 'left':
        return (
          <ReflexContainer className="inviewer"
            key="inviewer" orientation='vertical'>
            <ReflexElement
              onStartResize={this.onViewerStartResize}
              onStopResize={this.onViewerStopResize}
              propagateDimensions={true}
              onResize={this.onResize}
              flex={viewerFlex}>
              { this.renderViewer() }
            </ReflexElement>
            <ReflexSplitter
              style={paneExtStyle}
            />
            <ReflexElement style={paneExtStyle}>
              { this.renderExtension() }
            </ReflexElement>
          </ReflexContainer>
        )
      case 'right':
        return (
          <ReflexContainer className="inviewer"
            key="inviewer" orientation='vertical'>
            <ReflexElement style={paneExtStyle}>
              { this.renderExtension() }
            </ReflexElement>
            <ReflexSplitter
              style={paneExtStyle}
            />
            <ReflexElement
              onStartResize={this.onViewerStartResize}
              onStopResize={this.onViewerStopResize}
              propagateDimensions={true}
              onResize={this.onResize}
              flex={viewerFlex}>
              { this.renderViewer() }
            </ReflexElement>
          </ReflexContainer>
        )
      case 'none':
        return (
          <ReflexContainer className="inviewer"
            key="inviewer" orientation='vertical'>
            <ReflexElement
              onStartResize={this.onViewerStartResize}
              onStopResize={this.onViewerStopResize}
              propagateDimensions={true}
              onResize={this.onResize}
              flex={viewerFlex}>
              { this.renderViewer() }
            </ReflexElement>
          </ReflexContainer>
        )
      }
  }
}
