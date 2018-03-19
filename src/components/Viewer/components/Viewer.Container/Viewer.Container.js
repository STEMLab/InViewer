import React from 'react'
import ReactDOM from 'react-dom'

import {ReflexContainer, ReflexElement, ReflexSplitter} from 'react-reflex'
import PropTypes from 'prop-types'

import BaseComponent from 'BaseComponent'
import './Viewer.Container.scss'
import ViewerApp from 'Viewer.App'
import Panel from 'Panel'

export default class ViewerContainer extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor(props, context) {

    super(props, context)

    this.state = {
      dataExtension: null,
      viewerPanels: [],
      viewerFlex: 1.0,
      resizing: false,
      dbModel: {
        sidebar: {
          type: 'left'
        }
      }
    }

    this.viewerFlex = 1.0
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
    const { dbModel, viewerFlex, paneExtStyle } = this.state

    const sidebar = dbModel.sidebar

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
