import React, { Component } from 'react';
import axios from 'axios';

import openSocket from 'socket.io-client';

import { PlayerBar } from './PlayerBarComp'

export default class RoomList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      room: this.props.room,
      board: {},
      loading: 'Loading...',
      playerNum: 0,
      activatePlayer: 0,
    }
    this.players = {
      playerOne: "",
      playerOneScore: 0,
      playerTwo: "",
      playerTwoScore: 0,
      playerThree: "",
      playerThreeScore: 0,
    }
    this.socket = null
  }

  componentDidMount() {
    const { getAccessToken } = this.props.auth;
    const headers = { 'Authorization': `Bearer ${getAccessToken()}`, 'room_id': this.state.room }
    axios.get(`${this.props.API_URL}/roomlist/getboard`, { headers })
      .then(response => {
        this.setState({
          board: response.data.board,
          loading: '',
        })
        this.socketSetup()
      })
      .catch(error => {
        console.log(error)
        this.setState({
          loading: 'Error, see console'
        })
      })

    // window.onbeforeunload = () => {
    //   this.socket.emit('disconnect', { room_id: this.state.room, access_token: this.props.auth.getAccessToken() })
    //   return null
    // }
  }

  socketSetup = () => {
    this.socket = openSocket('http://localhost:5000/jep')

      this.socket.on('connect', () => {
        console.log("connect")
        this.socket.emit('join_room', { room_id: this.state.room, access_token: this.props.auth.getAccessToken() })
      })

      this.socket.on('ping_check', (msg) => {
        console.log(msg)
        this.socket.emit('pong_res', { ping_num: msg.ping_num, access_token: this.props.auth.getAccessToken() })
      })

      this.socket.on('has_joined_room', (msg) => {
        console.log("joined_room",msg)
        const room = msg.room_list
        this.players = {
          playerOne: room.players.one.username,
          playerOneScore: room.players.one.score,
          playerTwo: room.players.two.username,
          playerTwoScore: room.players.two.score,
          playerThree: room.players.three.username,
          playerThreeScore: room.players.three.score,
        }
        this.setState({
          activatePlayer:1,
        })
      })

      this.socket.on('player_selected', (msg) => {
        console.log("player_selected",msg)
        if(msg.position === "one"){
          this.players = {
            playerOne:msg.username[0],
          }
        } else if (msg.position === "two"){
          this.players = {
            playerTwo:msg.username[0],
          }
        } else if (msg.position === "three"){
          this.players = {
            playerThree:msg.username[0],
          }
        }
        this.setState({
          activatePlayer:1,
        })
      })

      this.socket.on('test', (msg) => {
        console.log(msg)
      })
  }

  testemit = () => {
    this.socket.emit('test', { data: 'test' })
  }

  createBoard = () => {
    console.log(this.state.board)
    let board = []
    for (let key in this.state.board) {
      board.push(<ul className="boardColumn">
        <li className="boardColumnTitle" key={key.replace(/[^A-Za-z]/g, '')}>{key}</li>
        {this.state.board[key].map((v) =>
          <li
            id={key.replace(/[^A-Za-z]/g, '') + v.value}
            key={key.replace(/[^A-Za-z]/g, '') + v.value}
            className="boardColumnScreen"
            onClick={this.testemit}
          >{v.value}</li>)}
      </ul>)
    }
    return board
  }

  selectPlayer = (pos) => {
    this.socket.emit('player_select', {access_token: this.props.auth.getAccessToken(), position:pos})
  }

  render() {
    if (this.state.loading !== '') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }}>
          <h1>{this.state.loading}</h1>
        </div>
      );
    }

    if(this.state.loading === ''){
      return (
        <>
          <div className="boardWrapper">
            {this.createBoard()}
          </div>
          <PlayerBar players={this.players} selectPlayer={this.selectPlayer} activatePlayer={this.state.activatePlayer}/>
        </>
      );
    }
  }
}