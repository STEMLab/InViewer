import { LinkContainer } from 'react-router-bootstrap'
import { browserHistory } from 'react-router'
import React from 'react'
import PropTypes from 'prop-types'
import ServiceManager from 'SvcManager'
import './Menubar.scss'
import {
  DropdownButton,
  NavDropdown,
  MenuItem,
  NavItem,
  Navbar,
  Button,
  Modal,
  Nav,
  FormGroup,
  FormControl
  } from 'react-bootstrap'
import Uploader from 'Uploader'

export default class Menubar extends React.Component {

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    constructor (props, context) {
      super(props, context)
    }

    /////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////
    render() {
      return (
        <Navbar className="inviewer-navbar">
          <Navbar.Header>
            <Navbar.Brand>
              <NavItem className="inviewer-brand-item"
                href="http://indoorgml.net"
                target="_blank">
                <img height="60" src="/resources/img/logos/indoorgml.png"/>
                <label className="inviewer-brand-name"> &nbsp; InViewer - IndoorGML Viewer </label>
              </NavItem>
            </Navbar.Brand>
            <Navbar.Toggle/>
          </Navbar.Header>

          <Navbar.Collapse>

            <Nav>
              <NavItem eventKey={1}
                href="#"
                onClick={() => {window.location.reload(true)}}
              >
                <label className="nav-label">
                  &nbsp; New &nbsp;
                </label>
              </NavItem>

              <NavDropdown id="open-dropdown" eventKey={2}
                  title={
                    <div className="dropdown-div">
                      <label className="nav-label">
                      &nbsp; Open &nbsp; &nbsp;
                      </label>
                    </div>
                    }>
                    <div className="uploader">
                      <Uploader
                        onIGMLResponseSuccess={this.props.onIGMLResponseSuccess}
                      />
                    </div>
              </NavDropdown>

              <NavDropdown id="views-dropdown" eventKey={3}
                  title={
                    <div className="dropdown-div">
                      <label className="nav-label">
                      &nbsp; Views &nbsp; &nbsp;
                      </label>
                    </div>
                    }>

                  <MenuItem eventKey={3.1} onClick={() => {

                  }}>
                      <span className="fa fa-columns"/>
                      &nbsp; SideMenu &nbsp;
                  </MenuItem>

                  <MenuItem divider/>

                  <MenuItem eventKey={3.2} onClick={() => {

                  }}>
                      <span className="fa fa-tree"/>
                      &nbsp; TreeView &nbsp;
                  </MenuItem>
              </NavDropdown>
              <NavDropdown id="settings-dropdown" eventKey={4}
                  title={
                    <div className="dropdown-div">
                      <label className="nav-label">
                      &nbsp; Settings &nbsp;
                      </label>
                    </div>
                    }>
                  <MenuItem eventKey={4.1} onClick={() => {

                  }}>
                      <span className="fa fa-th-large"/>
                      &nbsp; Grid &nbsp;
                  </MenuItem>

                  <MenuItem divider/>

                  <MenuItem eventKey={4.2} onClick={() => {
                  }}>
                      <span className="fa fa-paint-brush">
                      </span>
                    &nbsp; Select theme ...
                  </MenuItem>
              </NavDropdown>
              <NavDropdown id="about-dropdown" eventKey={5}
                  title={
                    <div className="dropdown-div">
                      <label className="nav-label">
                      &nbsp; &nbsp; About &nbsp; &nbsp;
                      </label>
                    </div>
                    }>
                  <MenuItem
                    eventKey={5.1}
                    onClick={() => {}}
                    href="http://github.com/STEMLab"
                    target="_blank"
                  >
                      <span className="fa fa-github"/>
                      &nbsp; Visit project &nbsp;
                  </MenuItem>

                  <MenuItem eventKey={5.2} onClick={() => {
                  }}>
                      <span className="fa fa-user"/>
                      &nbsp; About us &nbsp;
                  </MenuItem>
              </NavDropdown>
            </Nav>

            <Nav pullRight className="search-nav">
              <NavItem eventKey={6}>
                <FormGroup className="form-inline search-bar">
                  <FormControl type="text" placeholder="Search" className="search-control" />
                  <Button type="submit" className="search-btn"><span className="fa fa-search"></span></Button>
                </FormGroup>
              </NavItem>
            </Nav>

          </Navbar.Collapse>
        </Navbar>
      )
    }
}
