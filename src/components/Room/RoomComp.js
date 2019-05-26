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
      loading: 'Loading...',
      playerNum: 0,
      activePlayer: 0,
      started:0,
      ready:false,
      player_id:0,
      viewers:0,
      screenText:'',
      screenInput:'',
      buzzable:false,
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
    this.board = {}
    this.socket = null

    this.numbers = ['zero','one','two','three']
  }

  componentDidMount() {
    const { getAccessToken } = this.props.auth;
    const headers = { 'Authorization': `Bearer ${getAccessToken()}`, 'room_id': this.state.room }
    axios.get(`${this.props.API_URL}/roomlist/getboard`, { headers })
      .then(response => {
        this.board = response.data.board
        this.setState({
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
        this.socket.emit('pong_res', { ping_num: msg.ping_num, access_token: this.props.auth.getAccessToken() })
      })

      this.socket.on('has_joined_room', (msg) => {
        this.players = {
          ...this.players,
          playerOne: msg.players.one.username,
          playerOneScore: msg.players.one.score,
          playerOneReady:msg.players.two.ready,
          playerTwo: msg.players.two.username,
          playerTwoScore: msg.players.two.score,
          playerTwoReady:msg.players.two.ready,
          playerThree: msg.players.three.username,
          playerThreeScore: msg.players.three.score,
          playerThreeReady:msg.players.three.ready,
        }
        this.setState({
          activePlayer:msg.active_player,
          playerNum:(msg.position !== 0)?msg.position:this.state.playerNum,
          started:msg.started,
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
            playerNum:msg.position
          })
        } else {
          this.setState({})
        }
      })

      this.socket.on('ready_player', (msg) => {
        console.log(msg)
        if(msg.position === 'one'){
          this.players = {
            ...this.players,
            playerOneReady:msg.ready,
          }
        } else if (msg.position === 'two') {
          this.players = {
            ...this.players,
            playerTwoReady:msg.ready,
          }
        } else if (msg.position === 'three') {
          this.players = {
            ...this.players,
            playerThreeReady:msg.ready,
          }
        }
        if(this.state.playerNum === msg.position) {
        this.setState({
            ready:msg.ready,
            started:msg.started,
          })
        } else {
          this.setState({
            started:msg.started,
          })
        }
        if(msg.started === 1){
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
        }
      })

      this.socket.on('screen_selected', (msg) => {
        this.board[msg.category][msg.clue]['answered'] = true
        this.setState({
          screenText:msg.screen_text,
          activePlayer:msg.active_player
        })
      })

      this.socket.on('buzzable', (msg) => {
        this.setState({
          buzzable:msg.buzz,
        })
      })

      this.socket.on('fastest_buzz', (msg) => {
        console.log('buzzed in: ',msg.buzzedIn)
        this.setState({
          buzzable:false,
          activePlayer:msg.buzzedIn,
        })
      })

      this.socket.on('no_buzz', (msg) => {
        console.log('no buzz')
        const catclue = msg.screen_clicked.split("|")
        this.board[catclue[0]][catclue[1]].answered = true
        this.setState({
          screenText:'',
          activePlayer:msg.active_player,
          buzzable:false,
        })
      })

      this.socket.on('typed_answer', (msg) => {
        this.setState({
          screenInput:msg.answer_input
        })
      })

      this.socket.on('answer_response', (msg) => {
        if(msg.correct){
          if(msg.position === 'one'){
            this.players = {
              ...this.players,
              playerOneScore:msg.new_score,
            }
          } else if (msg.position === 'two') {
            this.players = {
              ...this.players,
              playerOneScore:msg.new_score,
            }
          } else if (msg.position === 'three') {
            this.players = {
              ...this.players,
              playerOneScore:msg.new_score,
            }
          }
          this.setState({
            activePlayer:msg.position,
            
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

  selectPlayer = (pos) => {
    this.socket.emit('player_select', {access_token: this.props.auth.getAccessToken(), position:pos})
  }

  readyClick = () => {
    this.socket.emit('player_ready', {access_token: this.props.auth.getAccessToken()})
  }

  screenSelect = (e) => {
    this.socket.emit('screen_select', { screen_clicked: e.target.id })
  }

  answerInput = (e) => {
    this.setState({
      screenInput:e.target.value
    })
    this.socket.emit('answer_typed', { answer:e.target.value })
  }

  buzzIn = () => {
    console.log('buzz in')
    this.setState({
      buzzable:false,
    })
    this.socket.emit('buzz_in')
  }

  submitAnswer = () => {
    this.socket.emit('answer_submit', { answer:this.state.screenInput })
  }

  testemit = (e) => {
    this.socket.emit('test', { data: 'test' })
  }

  createBoard = () => {
    let board = []
    for (let key in this.board) {
      board.push(<ul className="boardColumn">
        <li className="boardColumnTitle" key={key.replace(/[^A-Za-z]/g, '')}>{this.board[key][0].category}</li>
        {this.board[key].map((v, i) =>
          <li
            id={key.replace(/[^A-Za-z]/g, '') + '|' + i}
            key={key.replace(/[^A-Za-z]/g, '') + ' ' + i}
            className="boardColumnScreen"
            onClick={(this.state.activePlayer === this.numbers.indexOf(this.state.playerNum))?this.screenSelect:null}
            style={(this.state.activePlayer === this.numbers.indexOf(this.state.playerNum))?{cursor:'pointer'}:{cursor:'none'}}
          >{(!v.answered)?v.value:null}</li>
        )}
      </ul>)
    }
    return board
  }

  readyBox = () => {
    return(
      <div className="readyWrapper">
        <button onClick={this.readyClick} style={(this.state.ready)?{background:'white',color:'#060ce9'}:{background:'#060ce9',color:'white'}}>Ready</button>
      </div>
    );
  }

  buttonOrInput = () => {
    if(this.state.playerNum !== 0){
      if(this.state.activePlayer !== 0) {
        return(
          <>
            <input 
              type='text' 
              name='answer' 
              value={this.state.screenInput} 
              onChange={(this.state.activePlayer === this.numbers.indexOf(this.state.playerNum))?this.answerInput:(e) => this.setState({screenInput:e.target.value})}
            />
            <button onClick={this.submitAnswer}>Submit</button>
          </>
        )
      } else {
        if(this.state.buzzable){
          return(
            <button onClick={this.buzzIn}>Buzz In</button>
          )
        } else {
          return(
            <div></div>
          )
        }
      }
    } else {
      return(
        <div>{this.state.screenInput}</div>
      )
    }
  }

  largeScreen = () => {
    return(
      <div className="largeScreenWrapper">
        <div className="largeScreenInnerWrapper">
          <span>{this.state.screenText}</span>
          {this.buttonOrInput()}
        </div>
      </div>
    )
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
            {(this.state.started === 0 && this.state.playerNum !== 0)?this.readyBox():null}
            {(this.state.screenText !== '')?this.largeScreen():null}
            {this.createBoard()}
          </div>
          <PlayerBar players={this.players} selectPlayer={this.selectPlayer} activePlayer={this.state.activePlayer}/>
        </>
      );
    }
  }
}