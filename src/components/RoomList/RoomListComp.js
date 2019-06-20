import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";

import { UsernameBox } from '../UsernameBoxComp'
import RoomComp from '../Room/RoomComp'

import { connect, getRoomList } from '../../connectionControllers/apiController'
import { MakeRoomList } from './MakeRoomList';
import { MenuComp } from '../MenuComp';
import { RoomListMenuComp } from './RoomListMenuComp';

export default class RoomList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      authorized: false,
      loading: "Loading...",
      roomlist: undefined,
      usernameNeeded: false,
      username: "",
      room: 0,
    }
  }

  componentDidMount() {
    if (this.state.authorized === false) {
      connect(this.stateSetter, this.props.auth, this.props.history)
    }
  }

  exitBox = () => this.setState({ usernameNeeded: false })

  stateSetter = (state = {}) => this.setState(state)



  render() {
    window.clearInterval(localStorage.getItem("timerKey"))
    localStorage.removeItem("timerKey")

    if (this.state.loading !== "") {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: 'calc(100vh - 60px)' }}>
          <h1>{this.state.loading}</h1>
        </div>
      );
    }

    if (this.state.roomlist === undefined && this.state.authorized === true) {
      getRoomList(this.props.auth, this.stateSetter)
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: 'calc(100vh - 60px)' }}>
          <h1>{this.state.loading}</h1>
        </div>
      );
    }

    return (
      <div className="fullWrapper">
        <div className="fullInnerWrapper">
          <MenuComp username={this.state.username} room={this.state.room} stateSetter={this.stateSetter} auth={this.props.auth} />
          <UsernameBox exitBox={this.exitBox} show={this.state.usernameNeeded} auth={this.props.auth} stateSetter={this.stateSetter} history={this.props.history} />
          {(this.state.room === 0) ?
            <div className="notMenu">
              <RoomListMenuComp auth={this.props.auth} stateSetter={this.stateSetter} />
              <ul className="roomList">
                <MakeRoomList roomlist={this.state.roomlist} stateSetter={this.stateSetter} />
              </ul>
            </div>
            :
            <Switch>
              <Route component={() => <RoomComp room={this.state.room} auth={this.props.auth} API_URL={this.state.API_URL} history={this.props.history} />} />
            </Switch>
          }
        </div>
      </div>
    );
  }
}
