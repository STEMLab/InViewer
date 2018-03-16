import Menubar from '../Menubar/Menubar'
import React from 'react'
import './Header.scss'

export default class Header extends React.Component {

  render () {

    return (
      <div>
        <Menubar {...this.props}/>
      </div>
    )
  }
}
