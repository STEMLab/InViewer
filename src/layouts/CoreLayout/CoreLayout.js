import autobind from 'autobind-decorator'
import NotificationsSystem from 'reapop'
import ServiceManager from 'SvcManager'

import '!style-loader!css-loader!bootstrap/dist/css/bootstrap.min.css';
import '!style-loader!css-loader!font-awesome/css/font-awesome.min.css';
import theme from 'reapop-theme-bootstrap'
import 'core.scss'

import PropTypes from 'prop-types'
import 'react-reflex/styles.css'
import Header from 'Header'
import React from 'react'

export default class CoreLayout extends React.Component {

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  static propTypes = {
    children : PropTypes.element.isRequired
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  constructor (props) {

    super(props)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillMount () {
    this.notifySvc =
      ServiceManager.getService(
        'NotifySvc')

    this.notifySvc.initialize ({
      remove: this.props.removeNotifications,
      update: this.props.updateNotification,
      add: this.props.addNotification
    })

    this.dialogSvc =
      ServiceManager.getService(
        'DialogSvc')

    this.dialogSvc.setComponent(this)
  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  componentWillUnmount () {

  }

  /////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////
  render () {

    return (
      <div className='container'>
        <div className='notifications'>
          <NotificationsSystem theme={theme}/>
        </div>
        <Header {...this.props} />
        <div className='core-layout__viewport'>
          {this.props.children}
        </div>
        { this.dialogSvc.render() }
      </div>
    )
  }
}
