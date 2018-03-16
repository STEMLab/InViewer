import ContentEditable from 'react-contenteditable'
import BaseComponent from 'BaseComponent'
import ServiceManager from 'SvcManager'
import Dropzone from 'react-dropzone'
import PropTypes from 'prop-types'
import './Uploader.scss'
import React from 'react'
import ClientAPI from 'ClientAPI'

export default class Uploader extends BaseComponent {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.dialogSvc = ServiceManager.getService(
      'DialogSvc')

    this.notifySvc = ServiceManager.getService(
      'NotifySvc')

    this.eventSvc = ServiceManager.getService(
      'EventSvc')

    this.onDrop = this.onDrop.bind(this)

    this.state = {
      rootFilename: null
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  guid (format = 'xxxxxxxxxx') {

    var d = new Date().getTime()

    var guid = format.replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16)
      })

    return guid
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onKeyDown (e) {

    if (e.keyCode === 13) {

      e.stopPropagation()
      e.preventDefault()
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onInitUpload = (data) => {

    const notification = this.notifySvc.add({
      title: 'Uploading ' + data.file.name,
      message: 'progress: 0%',
      dismissible: false,
      status: 'loading',
      id: data.uploadId,
      dismissAfter: 0,
      position: 'tl'
    })

    notification.buttons = [{
      name: 'Hide',
      onClick: () => {
        notification.dismissAfter = 1
        this.notifySvc.update(notification)
      }
    }]

    this.notifySvc.update(notification)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onUploadProgress = (data) => {

    const notification =
      this.notifySvc.getNotification(data.uploadId)

      var progress = data.percent * 0.5
      if(progress === NaN) {
        progress = 100
      }

      notification.message =
        `progress: ${progress.toFixed(2)}%`

      this.notifySvc.update(notification)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  async onDrop (files) {

    //const validUpload = await this.props.onFileDrop(files)

    const validUpload = true;

    if (validUpload) {

      const file = files[0]

      //const composite = await this.isComposite(files[0])

      const uploadId = this.guid()

      /*
      if (this.props.onInitUpload) {

        this.props.onInitUpload({
          uploadId,
          file
        })
      }
      */
      this.onInitUpload({uploadId, file})
      //const socketId = await this.socketSvc.getSocketId()

      /*
      const data = Object.assign({
        socketId,
        uploadId
      }, !!composite
        ? {
            rootFilename: composite
          }
        : null)
      */

      const options = {
        progress: (percent) => {

          /*
          if (this.props.onProgress) {

            this.props.onProgress({
              uploadId,
              percent,
              file
            })
          }
          */
          this.onUploadProgress({
            uploadId,
            percent,
            file
          })
        }
      }

      var notifyService = this.notifySvc
      var client = new ClientAPI('/api/igml')
      const eventSvc = this.eventSvc

      client.upload(uploadId, file, options)
      .then(function(response, error) {
        eventSvc.emit('igml.response', response, error)
      })
      .finally(function () {
        const notification = notifyService.getNotification(uploadId)
          notification.dismissAfter = 1
          notifyService.update(notification)
      });
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  renderContent () {
    return (
      <Dropzone className="content"
        onDrop={this.onDrop}
        multiple={false} >
        <hr/>
        <p>
          Drop a IndoorGML file here or click to browse ...
        </p>
        <hr/>
      </Dropzone>
    )
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return(
      <div className="igml-uploader">
        <div className="title">
          <span className="fa fa-cloud-upload"/>
          <label>
            Upload your IndoorGML File
          </label>
        </div>
        { this.renderContent() }
      </div>
    )
  }
}
