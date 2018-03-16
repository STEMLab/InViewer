import { browserHistory } from 'react-router'
import './Main.scss'
import React from 'react'
import ViewerContainer from 'Viewer.Container'

export default class MainView extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super (props)

    this.onError = this.onError.bind(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {

    /*
    this.props.setNavbarState({
      links: {
        settings: false
      }
    })
    */

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  onError = (error) => {

    if (error.status === 404) {

      browserHistory.push('/404')

    } else if (error) {

      console.log('unhandled error:')
      console.log(error)
    }
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    /*
    const view = this.props.location.query.id
      ? <ViewerConfigurator
          setNavbarState={this.props.setNavbarState}
          setViewerEnv={this.props.setViewerEnv}
          modelId={this.props.location.query.id}
          appState={this.props.appState}
          location={this.props.location}
          database='configurator'
          onError={this.onError}
          notify={this.notify}
          showLoader={true}
        />
      : <ConfiguratorHomeView/>
    */

    const view = <ViewerContainer
                    setMenubarState={this.props.setMenubarState}
                    setViewerEnv={this.props.setViewerEnv}
                    processIGMLResponse={this.props.processIGMLResponse}
                    appState={this.props.appState}
                    onError={this.onError}
                    notify={this.notify}
                 />

    return (
      <div className="main-view">
        { view }
      </div>
    )
  }
}
