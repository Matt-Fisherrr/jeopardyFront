import React, { Component } from 'react';
import axios from 'axios';
import { Route, Link, Switch, Redirect } from "react-router-dom";

import { UsernameBox } from '../UsernameBoxComp'
import RoomComp from '../Room/RoomComp'

export default class RoomList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      API_URL: 'http://10.44.22.86:5000/api', // URL HERE -------------------------------------------------------------------
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
      this.connect()
    }
  }

  connect = () => {
    const { getAccessToken, getIdToken } = this.props.auth;
    const headers = { 'Authorization': `Bearer ${getAccessToken()}` }
    const data = { IDToken: getIdToken() }
    axios.post(`${this.state.API_URL}/connect`, data, { headers })
      .then(response => {
        if (response.data.response === true) {
          this.setState({
            authorized: true,
            username: response.data.username,
            loading: '',
          })
        } else if (response.data.response === "username") {
          this.setState({
            authorized: true,
            usernameNeeded: true,
            username: '',
            loading: '',
          })
        }
      })
      .catch(error => {
        console.log(error)
        window.setTimeout(() => this.props.history.replace('/'), 100)
        this.setState({ loading: "Error, redirecting..." })
      })
  }

  exitBox = () => {
    this.setState({ usernameNeeded: false })
  }

  checkUser = (username) => {
    const { getAccessToken } = this.props.auth;
    const headers = { 'Authorization': `Bearer ${getAccessToken()}` }
    const data = { user: username }
    axios.post(`${this.state.API_URL}/connect/reg`, data, { headers })
      .then(response => {
        this.exitBox()
        this.setState({
          username: response.data.username
        })
      })
      .catch(error => {
        console.log(error)
        window.setTimeout(() => this.props.history.replace('/'), 100)
        this.setState({ loading: "Error, redirecting..." })
      })
  }

  getRoomList = () => {
    const { getAccessToken } = this.props.auth;
    const headers = { 'Authorization': `Bearer ${getAccessToken()}` }
    axios.get(`${this.state.API_URL}/roomlist`, { headers })
      .then(response => {
        this.setState({ roomlist: response.data })
      })
      .catch(error => {
        console.log(error)
      })
  }

  makeRoomList = () => {
    try {
      return this.state.roomlist.map((v, i) => {
        return(
          <li key={v+i}>
            <Link to={"/rooms/" + v.id} key={v + i} onClick={(e) => this.setState({ room: v.id })}>{
              <>
                <h1 className="roomListName">{v.name}</h1>
                <h1 className="roomListPlayers">{(v.players !== 'started')?"Number of players:" + v.players + "/3":"Started"}</h1>
              </>
            }</Link>
          </li>
        )
      })
    } catch (e) {
      console.log(e)
    }
  }

  createRoom = (e) =>{
    this.setState({
      loading:'Loading...'
    })
    const { getAccessToken } = this.props.auth;
    const headers = { 'Authorization': `Bearer ${getAccessToken()}` }
    const data = { roomName: e.target.parentNode.children.searchCreateInput.value }
    axios.post(`${this.state.API_URL}/roomlist/create`, data, { headers })
      .then(response => {
        this.setState({
          room:response.data.room_id,
          loading:'',
        })
        return <Redirect to={`/rooms/${response.data.room_id}`} />
      })
      .catch(error => {
        console.log(error)
        this.setState({
          loading:'Error, see console'
        })
      })
  }

  render() {
    window.clearInterval(localStorage.getItem("timerKey"))
    localStorage.removeItem("timerKey")

    if (this.state.loading !== "") {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }}>
          <h1>{this.state.loading}</h1>
        </div>
      );
    }

    if (this.state.roomlist === undefined && this.state.authorized === true) {
      this.getRoomList()
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }}>
          <h1>{this.state.loading}</h1>
        </div>
      );
    }

    return (
      <div className="fullWrapper">
        <div className="fullInnerWrapper">
          <div className="topMenu">
            <span>Username: {this.state.username}{(this.state.room === 0)?<button className="editButton" onClick={() => this.setState({ usernameNeeded: true })}>✏</button>:null}</span>
            <button className="logOutButton" onClick={this.props.auth.logout} >Log Out</button>
          </div>
          <UsernameBox exitBox={this.exitBox} checkUser={this.checkUser} show={this.state.usernameNeeded} />
          {(this.state.room === 0) ?
            <>
              <div className="roomListMenu">
                <button className="refreshButton" onClick={this.getRoomList}>Refresh room list</button>
                <input type="text" id="searchCreateInput" placeholder="Create room" maxLength='30'/>
                <button onClick={this.createRoom}>Create Room</button>
              </div>
              <ul className="roomList">{this.makeRoomList()}</ul>
            </>
            :
            <Switch>
              <Route component={() => <RoomComp room={this.state.room} auth={this.props.auth} API_URL={this.state.API_URL} history={this.props.history}/>} />
            </Switch>
          }
        </div>
      </div>
    );
  }
}
