////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2016 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
///////////////////////////////////////////////////////////
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import React from 'react'
import './ViewerApp.scss'
import ThreeViewer from 'ThreeViewer'
import ServiceManager from 'SvcManager'

import IGMLHelper from 'IGMLHelper'
import IJSONHelper from 'IJSONHelper'

import Indoor from 'Indoor'

export default class ViewerApp extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    panels: PropTypes.array
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static defaultProps = {
    panels: [],
    style: {}
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor () {

    super()

    this.height = 0

    this.width = 0

    this.eventSvc = ServiceManager.getService(
      'EventSvc')

    this.socketSvc = ServiceManager.getService(
      'SocketSvc')
  }

  /////////////////////////////////////////////////////////
  // Component has been mounted so this container div is now created
  // in the DOM and viewer can be instantiated
  //
  /////////////////////////////////////////////////////////
  componentDidMount () {

    this.viewer = new ThreeViewer(
      this.viewerContainer)

    //this.panelsContainer = document.createElement('div')

    //this.viewer.container.appendChild(
    //  this.panelsContainer)

    if (this.props.onViewerCreated) {
      this.props.onViewerCreated(this.viewer)
    }

    const viewer = this.viewer
    const self = this

    this.eventSvc.on('igml.response',
      function(response, error) {
        viewer.clear()
        self.onIGMLResponseSuccess(response, error)
        .then(function(object) {
          viewer.setObject(object)
      })
    })

    this.socketSvc.on('ijson.response',
      function(response, error) {
        viewer.clear()
        self.onIJSONResponseSuccess(response, error)
        .then(function(object) {
          viewer.setObject(object)
        })
    })

    this.socketSvc.connect()
  }

  componentWillMount () {

  }

  /////////////////////////////////////////////////////////
  // Component will unmount so we can destroy the viewer to avoid
  // memory leaks
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

    if (this.viewer) {

      //if(this.viewer.impl.selector) {

      //  this.viewer.tearDown()
      //  this.viewer.finish()
        this.viewer = null
      }

      this.eventSvc.off('igml.response',
        this.onIGMLResponseSuccess)

      this.socketSvc.off('ijson.response',
        this.onIJSONResponseSuccess)
  }

  onIJSONResponseSuccess (response, error) {
    return new Promise(function (resolve, reject) {
      if(error) {
        reject(error)
      }

      var content = response

      var iJsonHelper = new IJSONHelper()
      iJsonHelper.makeGeometry(content)
      var object = iJsonHelper.createObject(content)

      console.log(object)

      if(object !== undefined) {
        return resolve(object)
      } else {
        reject()
      }
    });
  }

  onIGMLResponseSuccess (response, error) {
    return new Promise(function (resolve, reject) {
      if(error) {
        reject(error)
      }

      var content = response.body
      content = JSON.parse(content)

      var indoor = new Indoor()
      indoor.fromJSON(content)

      var igmlHelper = new IGMLHelper()
      igmlHelper.makeGeometry(indoor)
      var object = igmlHelper.createObject(indoor)

      if(object !== undefined) {
        return resolve(object)
      } else {
        reject()
      }
    });
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillReceiveProps (props) {

    //const panels = props.panels.map((panel) => {
    //
    //  return panel.render()
    //})
    //
    //this.panelsContainer = ReactDOM.render(
    //  <div className="viewer-panels-container">
    //    { panels }
    //  </div>, this.panelsContainer)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentDidUpdate () {

    if (this.viewer) {

      if (this.viewerContainer.offsetHeight !== this.height ||
          this.viewerContainer.offsetWidth !== this.width) {

        this.height = this.viewerContainer.offsetHeight
        this.width = this.viewerContainer.offsetWidth

        this.viewer.resize()
      }
    }

    /*
    this.props.panels.map((panel) => {

      panel.emit('update')
    })
    */

  }

  /////////////////////////////////////////////////////////
  // Render component, resize the viewer if exists
  //
  /////////////////////////////////////////////////////////
  render() {

    /*
    const panels = this.props.panels.map((panel) => {

      return panel.render()
    })
    */
    var style = {
      height : "100%",
      width : "100%",
      overflow : "hidden"
    }

    return (
      <div className="viewer-app-container">

        <div ref={(div) => this.viewerContainer = div}
          className="viewer-container"
          style={style}
        />

      </div>
    )

    /*
    <div className="viewer-panels-container">
      { panels }
    </div>
    */
  }
}
