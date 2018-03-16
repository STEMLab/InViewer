import React from 'react'
import Dropzone from 'react-dropzone'

export default class FileUpload extends React.Component {

  constructor() {
    super()
    this.state = {
      accept: '',
      files: [],
      dropzoneActive: false
    }
  }

  onDragEnter() {
    console.log('onDragEnter')
    this.setState({
      dropzoneActive: true
    });
  }

  onDragLeave() {
    console.log('onDragLeave')
    this.setState({
      dropzoneActive: false
    });
  }

  onDrop(files) {
    console.log('onDrop')
    this.setState({
      files,
      dropzoneActive: false
    });
  }

  applyMimeTypes(event) {
    this.setState({
      accept: event.target.value
    });
  }

  render() {
    const { accept, files, dropzoneActive } = this.state;
    const overlayStyle = {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      padding: '2.5em 0',
      background: 'rgba(0,0,0,0.5)',
      textAlign: 'center',
      color: '#fff'
    };

    return (
      <Dropzone
        style={{position: "relative"}}
        accept={accept}
        onDrop={this.onDrop.bind(this)}
        onDragEnter={this.onDragEnter.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
      >
      { dropzoneActive && <div style={overlayStyle}>Drop files...</div> }
      </Dropzone>
    )
  }
}
