import React, { Component } from 'react';
import axios from 'axios';
// import { Redirect } from "react-router-dom";

import openSocket from 'socket.io-client';

import { PlayerBar } from './PlayerBarComp'

var HtmlToReactParser = require('html-to-react').Parser;

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
      inputAvailable:true,
      largeScreenX:0,
      largeScreenY:0,
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

    this.htmlToReactParser = new HtmlToReactParser();
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
    this.socket = openSocket('http://10.44.22.86:5000/jep') // URL HERE -------------------------------------------------------------------

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
          playerOneReady:msg.players.one.ready,
          playerTwo: msg.players.two.username,
          playerTwoScore: msg.players.two.score,
          playerTwoReady:msg.players.two.ready,
          playerThree: msg.players.three.username,
          playerThreeScore: msg.players.three.score,
          playerThreeReady:msg.players.three.ready,
        }
        if(msg.started){
          this.players = {
            ...this.players,
            playerOneReady:false,
            playerTwoReady:false,
            playerThreeReady:false,
          }
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
        if(msg.buzzable_players.includes(this.state.playerNum)){
          this.setState({
            buzzable:msg.buzz,
          })
        }
      })

      this.socket.on('fastest_buzz', (msg) => {
        console.log('buzzed in: ',msg.buzzedIn)
        this.setState({
          buzzable:false,
          activePlayer:msg.buzzedIn,
          inputAvailable:true,
        })
      })

      this.socket.on('no_buzz', (msg) => {
        console.log('no buzz')
        const catclue = msg.screen_clicked.split("|")
        this.board[catclue[0]][catclue[1]].answered = true
        this.setState({
          buzzable:false,
        })
      })

      this.socket.on('typed_answer', (msg) => {
        if(this.numbers[this.state.activePlayer] !== this.state.playerNum){
          this.setState({
            screenInput:msg.answer_input
          })
        }
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
              playerTwoScore:msg.new_score,
            }
          } else if (msg.position === 'three') {
            this.players = {
              ...this.players,
              playerThreeScore:msg.new_score,
            }
          }
          this.setState({
            activePlayer:this.numbers.indexOf(msg.position),
            screenText:'',
            screenInput:'',
          })
        } else {
          if(msg.position === 'one'){
            this.players = {
              ...this.players,
              playerOneScore:msg.new_score,
            }
          } else if (msg.position === 'two') {
            this.players = {
              ...this.players,
              playerTwoScore:msg.new_score,
            }
          } else if (msg.position === 'three') {
            this.players = {
              ...this.players,
              playerThreeScore:msg.new_score,
            }
          }
          this.setState({
            buzzable: false,
            activePlayer: 0,
            screenInput:'',
          })
        }
      })

      this.socket.on('no_correct_answer', (msg) => {
        console.log(msg)
        this.setState({
          activePlayer:msg.position,
          screenText:msg.answer,
          screenInput:'',
          inputAvailable:false,
        })
        window.setTimeout(() => this.setState({
          screenText:'',
        }), 3000)
      })


      this.socket.on('error', () => {
        this.setState({
          loading:'Connection to server lost'
        })
        window.setTimeout(() => this.props.history.replace('/'), 100)
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
            style={(this.state.activePlayer === this.numbers.indexOf(this.state.playerNum))?(!v.answered)?{cursor:'pointer'}:{cursor:'initial'}:{cursor:'initial'}}
          >{(!v.answered)?<span style={{pointerEvents:'none'}}>{v.value}</span>:null}</li>
        )}
      </ul>)
    }
    return board
  }

  readyBox = () => {
    return(
      <div className="readyWrapper">
        <button onClick={this.readyClick} style={(this.state.ready)?{background:'#494eef', color:'white'}:null}>Ready</button>
      </div>
    );
  }

  buttonOrInput = () => {
    if(this.state.playerNum !== 0){
      if(this.state.activePlayer !== 0 && this.state.inputAvailable) {
        return(
          <>
            <input 
              type='text' 
              name='answer' 
              value={this.state.screenInput} 
              onChange={(this.state.activePlayer === this.numbers.indexOf(this.state.playerNum))?this.answerInput:(e) => this.setState({screenInput:e.target.value})}
            />
            {(this.numbers[this.state.activePlayer] === this.state.playerNum)?<button onClick={this.submitAnswer}>Submit</button>:null}
          </>
        )
      } else {
        if(this.state.buzzable){
          return(
            <button onClick={this.buzzIn} className='buzzButton'>Buzz In</button>
          )
        } else {
          return(
            <div></div>
          )
        }
      }
    } else {
      return(
        <div style={{color:'white'}}>{this.state.screenInput}</div>
      )
    }
  }

  largeScreen = () => {
    console.log(this.state.screenText.replace(/\\/g,''))
    return(
      <div className="largeScreenWrapper">
        <div className="largeScreenInnerWrapper">
          <span>{this.htmlToReactParser.parse(this.state.screenText.replace(/\\/g,''))}</span>
          {this.buttonOrInput()}
        </div>
      </div>
    )
  }

  render() {
    console.log(this.state, this.board)
    if (this.state.loading !== '') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          <h1>{this.state.loading}</h1>
        </div>
      );
    }
    if(this.state.loading === ''){
      return (
        <div className='inRoom'>
          <div className="boardWrapper">
            {(this.state.started === 0 && this.state.playerNum !== 0)?this.readyBox():null}
            {(this.state.screenText !== '')?this.largeScreen():null}
            {this.createBoard()}
          </div>
          <PlayerBar players={this.players} selectPlayer={this.selectPlayer} activePlayer={this.state.activePlayer} playerNum={this.state.playerNum} started={this.state.started} />
        </div>
      );
    }
  }
}