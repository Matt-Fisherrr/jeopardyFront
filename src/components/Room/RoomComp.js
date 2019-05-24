import React, { Component } from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

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
      activePlayer: 0,
      started:false,
      ready:false,
      player_id:0,
      viewers:0,
    }
    this.players = {
      playerOne: "",
      playerOneScore: 0,
      playerOneReady:false,
      playerTwo: "",
      playerTwoScore: 0,
      playerTwoReady:false,
      playerThree: "",
      playerThreeScore: 0,
      playerThreeReady:false,
    }
    this.socket = null

    this.numbers = ['zero','one','two','three']
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
        this.socket.emit('join_room', { room_id: this.state.room, access_token: this.props.auth.getAccessToken() })
      })

      this.socket.on('ping_check', (msg) => {
        console.log(msg)
        this.socket.emit('pong_res', { ping_num: msg.ping_num, access_token: this.props.auth.getAccessToken() })
      })

      this.socket.on('has_joined_room', (msg) => {
        const room = msg.room_list
        this.players = {
          ...this.players,
          playerOne: room.players.one.username,
          playerOneScore: room.players.one.score,
          playerTwo: room.players.two.username,
          playerTwoScore: room.players.two.score,
          playerThree: room.players.three.username,
          playerThreeScore: room.players.three.score,
        }
        this.setState({
          activePlayer:msg.room_list.active_player,
          playerNum:(msg.position !== 0)?msg.position:this.state.playerNum,
          started:msg.room_list.started,
          player_id:msg.player_id,
        })
        this.socket.emit('viewer_joined')
      })

      this.socket.on('viewer_added', (msg) => {
        console.log(`Viewers: ${msg.viewers}`)
        this.setState({
          viewers:msg.viewers,
        })
      })

      this.socket.on('player_selected', (msg) => {
        console.log("player_selected",msg)
        if(msg.position.toLowerCase() === "one"){
          this.players = {
            ...this.players,
            playerOne:msg.username,
          }
        } else if (msg.position.toLowerCase() === "two"){
          this.players = {
            ...this.players,
            playerTwo:msg.username,
          }
        } else if (msg.position.toLowerCase() === "three"){
          this.players = {
            ...this.players,
            playerThree:msg.username,
          }
        }
        if(msg.player_id === this.state.player_id){
          this.setState({
            playerNum:msg.playerNum
          })
        } else {
          this.setState({})
        }
      })

      this.socket.on('ready_player', (msg) => {
        switch(msg.position){
          case('one'):
            this.players = {
              ...this.players,
              playerOneReady:msg.ready,
            }
            break;
          case('two'):
            this.players = {
              ...this.players,
              playerTwoReady:msg.ready,
            }
            break;
          case('three'):
            this.players = {
              ...this.players,
              playerThreeReady:msg.ready,
            }
            break;
          default:
            break;
        }
        if(this.state.playerNum === msg.position) {
          if(msg.started === true){
            this.players = {
              ...this.players,
              playerOneReady:false,
              playerTwoReady:false,
              playerThreeReady:false,
            }
            this.setState({
              started:msg.started,
              activePlayer:1,
            })
          } else {
          this.setState({
              ready:msg.ready,
              started:msg.started,
            })
          }
        } else {
          this.setState({
            started:msg.started,
          })
        }
      })


      this.socket.on('error', () => {
        this.setState({
          loading:'Connection to server lost'
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
            style={(this.state.activePlayer === this.numbers.indexOf(this.state.playerNum))?{cursor:'pointer'}:{cursor:'none'}}
          >{v.value}</li>)}
      </ul>)
    }
    return board
  }

  selectPlayer = (pos) => {
    this.socket.emit('player_select', {access_token: this.props.auth.getAccessToken(), position:pos})
  }

  readyClick = () => {
    this.socket.emit('player_ready', {access_token: this.props.auth.getAccessToken()})
  }

  readyBox = () => {
    return(
      <div className="readyWrapper">
        <button onClick={this.readyClick} style={(this.state.ready)?{background:'white',color:'#060ce9'}:{background:'#060ce9',color:'white'}}>Ready</button>
      </div>
    );
  }

  render() {
    if (this.state.loading !== '') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <h1>{this.state.loading}</h1>
        </div>
      );
    }
    if(this.state.loading === ''){
      return (
        <>
          <div className="boardWrapper">
            {(this.state.started === false && this.state.playerNum !== 0)?this.readyBox():null}
            {this.createBoard()}
          </div>
          <PlayerBar players={this.players} selectPlayer={this.selectPlayer} activePlayer={this.state.activePlayer}/>
        </>
      );
    }
  }
}