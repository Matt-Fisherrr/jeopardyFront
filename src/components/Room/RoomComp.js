import React, { Component } from 'react';
import axios from 'axios';
// import { Redirect } from "react-router-dom";

import openSocket from 'socket.io-client';

import { PlayerBar } from './PlayerBarComp'
import { BoardComp } from './BoardComp'
import { LargeScreenComp } from './LargeScreenComp'
import { ReadyBox } from './ReadyBoxComp'

const HtmlToReactParser = require('html-to-react').Parser;

export default class RoomList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      room: this.props.room,
      loading: 'Loading...',
      playerNum: 0,
      activePlayer: 0,
      started: 0,
      ready: false,
      player_id: 0,
      viewers: 0,
      screenText: '',
      screenInput: '',
      buzzable: false,
      inputAvailable: true,
      largeScreenX: 0,
      largeScreenY: 0,
      largeScreenWidth: 0,
      largeScreenHeight: 0,
      largeScreenTransition: 'all 0s',
      activeScreen: '',
    }
    this.players = {
      playerOne: "",
      playerOneScore: 0,
      playerOneReady: false,
      playerTwo: "",
      playerTwoScore: 0,
      playerTwoReady: false,
      playerThree: "",
      playerThreeScore: 0,
      playerThreeReady: false,
    }
    this.board = {}
    this.socket = null

    this.htmlToReactParser = new HtmlToReactParser();

    this.numbers = ['zero', 'one', 'two', 'three']

    this.theBoard = null
    this.input = null
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

  componentDidUpdate() {
    if (this.input) {
      this.input.focus()
    }
  }

  socketSetup = () => {
    this.socket = openSocket('http://10.44.22.86:5000/jep') // URL HERE -------------------------------------------------------------------

    this.socket.on('connect', () => {
      this.socket.emit('join_room', { room_id: this.state.room, access_token: this.props.auth.getAccessToken() })
    })

    this.socket.on('ping_check', (msg) => {
      // console.log('pinged')
      this.socket.emit('pong_res', { ping_num: msg.ping_num, access_token: this.props.auth.getAccessToken() })
    })

    this.socket.on('has_joined_room', (msg) => {
      // console.log(msg)
      this.players = {
        ...this.players,
        playerOne: msg.players[1].username,
        playerOneScore: msg.players[1].score,
        playerOneReady: msg.players[1].ready,
        playerTwo: msg.players[2].username,
        playerTwoScore: msg.players[2].score,
        playerTwoReady: msg.players[2].ready,
        playerThree: msg.players[3].username,
        playerThreeScore: msg.players[3].score,
        playerThreeReady: msg.players[3].ready,
      }
      if (msg.started) {
        this.players = {
          ...this.players,
          playerOneReady: false,
          playerTwoReady: false,
          playerThreeReady: false,
        }
      }
      this.setState({
        activePlayer: msg.active_player,
        playerNum: (msg.position !== 0) ? msg.position : this.state.playerNum,
        started: msg.started,
        player_id: msg.player_id,
      })
      this.socket.emit('viewer_joined')
    })

    this.socket.on('viewer_added', (msg) => {
      console.log(`Viewers: ${msg.viewers}`)
      this.setState({
        viewers: msg.viewers,
      })
    })

    this.socket.on('player_selected', (msg) => {
      if (msg.position === 1) {
        this.players = {
          ...this.players,
          playerOne: msg.username,
        }
      } else if (msg.position === 2) {
        this.players = {
          ...this.players,
          playerTwo: msg.username,
        }
      } else if (msg.position === 3) {
        this.players = {
          ...this.players,
          playerThree: msg.username,
        }
      }
      if (msg.player_id === this.state.player_id) {
        this.setState({
          playerNum: msg.position
        })
      } else {
        this.setState({})
      }
    })

    this.socket.on('ready_player', (msg) => {
      // console.log(msg)
      if (msg.position === 'one') {
        this.players = {
          ...this.players,
          playerOneReady: msg.ready,
        }
      } else if (msg.position === 'two') {
        this.players = {
          ...this.players,
          playerTwoReady: msg.ready,
        }
      } else if (msg.position === 'three') {
        this.players = {
          ...this.players,
          playerThreeReady: msg.ready,
        }
      }
      if (this.state.playerNum === msg.position) {
        this.setState({
          ready: msg.ready,
          started: msg.started,
        })
      } else {
        this.setState({
          started: msg.started,
        })
      }
      if (msg.started === 1) {
        this.players = {
          ...this.players,
          playerOneReady: false,
          playerTwoReady: false,
          playerThreeReady: false,
        }
        this.setState({
          started: msg.started,
          activePlayer: 1,
        })
      }
    })

    this.socket.on('screen_selected', (msg) => {
      // console.log(msg, this)
      const catName = Object.keys(this.board[msg.category])
      this.board[msg.category][catName][msg.clue]['answered'] = true
      const xAndY = msg.x_and_y.split(' ')
      this.setState({
        activeScreen: msg.category + "|" + msg.clue,
        screenText: msg.screen_text,
        activePlayer: msg.active_player,
        largeScreenTransition: 'all 0.5s',
        largeScreenX: xAndY[0] + 'px',
        largeScreenY: xAndY[1] + 'px',
      })
      this.setState({
        largeScreenHeight: 0,
        largeScreenWidth: 0,
        largeScreenTransition: 'all 1s'
      })
      window.setTimeout(() => {
        this.setState({
          largeScreenHeight: this.theBoard.children[0].offsetHeight,
          largeScreenWidth: this.theBoard.offsetWidth,
          largeScreenX: this.theBoard.offsetLeft,
          largeScreenY: this.theBoard.offsetTop,
        })
      }, 500)
    })

    this.socket.on('buzzable', (msg) => {
      // console.log(msg,this.state.playerNum)
      if (msg.buzzable_players.includes(this.state.playerNum)) {
        this.setState({
          buzzable: msg.buzz,
        })
      }
    })

    this.socket.on('fastest_buzz', (msg) => {
      // console.log('buzzed in: ',msg.buzzedIn)
      this.setState({
        buzzable: false,
        activePlayer: msg.buzzedIn,
        inputAvailable: true,
      })
    })

    this.socket.on('no_buzz', (msg) => {
      // console.log('no buzz')
      const catclue = msg.screen_clicked.split("|")
      const catName = Object.keys(this.board[catclue[0]])
      this.board[catclue[0]][catName][catclue[1]].answered = true
      this.setState({
        buzzable: false,
      })
    })

    this.socket.on('typed_answer', (msg) => {
      if (this.numbers[this.state.activePlayer] !== this.state.playerNum) {
        this.setState({
          screenInput: msg.answer_input
        })
      }
    })

    this.socket.on('take_too_long', () => {
      this.socket.emit('answer_submit', { answer: this.state.screenInput })
    })

    this.socket.on('answer_response', (msg) => {
      console.log(msg)
      if (msg.correct) {
        if (msg.position === 1) {
          this.players = {
            ...this.players,
            playerOneScore: msg.new_score,
          }
        } else if (msg.position === 2) {
          this.players = {
            ...this.players,
            playerTwoScore: msg.new_score,
          }
        } else if (msg.position === 3) {
          this.players = {
            ...this.players,
            playerThreeScore: msg.new_score,
          }
        }
        this.setState({
          activePlayer: this.numbers.indexOf(msg.position),
          activeScreen: '',
          screenText: '',
          screenInput: '',
        })
      } else {
        if (msg.position === 1) {
          this.players = {
            ...this.players,
            playerOneScore: msg.new_score,
          }
        } else if (msg.position === 2) {
          this.players = {
            ...this.players,
            playerTwoScore: msg.new_score,
          }
        } else if (msg.position === 3) {
          this.players = {
            ...this.players,
            playerThreeScore: msg.new_score,
          }
        }
        this.setState({
          buzzable: false,
          activePlayer: 0,
          screenInput: '',
        })
      }
    })

    this.socket.on('no_correct_answer', (msg) => {
      // console.log(msg)
      this.setState({
        activePlayer: msg.position,
        screenText: msg.answer,
        activeScreen: '',
        screenInput: '',
        inputAvailable: false,
      })
      window.setTimeout(() => this.setState({
        screenText: '',
      }), 3000)
    })

    this.socket.on('winner', (msg) => {
      this.socket.disconnect()
      console.log(msg.username)
      if (Array.isArray(msg.username)) {
        const usernames = msg.username.join(', ')
        this.setState({
          loading: `Tie!\n${usernames}`
        })
      } else {
        this.setState({
          loading: `Winner!\n${msg.username}`
        })
      }
    })


    this.socket.on('error', () => {
      this.setState({
        loading: 'Connection to server lost'
      })
      window.setTimeout(() => this.props.history.replace('/'), 100)
    })

    this.socket.on('test', (msg) => {
      console.log(msg)
    })
  }

  selectPlayer = (pos) => {
    // console.log(pos)
    this.socket.emit('player_select', { access_token: this.props.auth.getAccessToken(), position: pos })
  }

  readyClick = () => {
    this.socket.emit('player_ready', { access_token: this.props.auth.getAccessToken() })
  }

  screenSelect = (e) => {
    const xAndY = e.target.offsetLeft + " " + e.target.offsetTop
    this.socket.emit('screen_select', { screen_clicked: e.target.id, x_and_y: xAndY })
  }

  answerInput = (e) => {
    this.setState({
      screenInput: e.target.value
    })
    this.socket.emit('answer_typed', { answer: e.target.value })
  }

  buzzIn = () => {
    // console.log('buzz in')
    this.setState({
      buzzable: false,
    })
    this.socket.emit('buzz_in')
  }

  submitAnswer = () => {
    this.socket.emit('answer_submit', { answer: this.state.screenInput })
  }

  testemit = (e) => {
    this.socket.emit('test', { data: 'test' })
  }

  typeAnswer = (e) => this.setState({ screenInput: e.target.value })

  render() {
    // console.log(this.state, this.board)
    if (this.state.loading !== '') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: 'calc(100vh - 60px)' }}>
          <h1>{this.state.loading}</h1>
        </div>
      );
    }
    if (this.state.loading === '') {
      // console.log(this.theBoard)
      return (
        <div className='inRoom' id='theBoard' ref={b => this.theBoard = b}>
          <div className="boardWrapper">
            {(this.state.started === 0 && this.state.playerNum !== 0) ? <ReadyBox readyClick={this.readyClick} ready={this.state.ready} /> : null}
            {(this.state.screenText !== '') ?
              <LargeScreenComp
                largeScreenY={this.state.largeScreenY}
                largeScreenX={this.state.largeScreenX}
                largeScreenWidth={this.state.largeScreenWidth}
                largeScreenHeight={this.state.largeScreenHeight}
                largeScreenTransition={this.state.largeScreenTransition}
                screenText={this.state.screenText}
                htmlToReactParser={this.htmlToReactParser}
                inputPass={{ playerNum: this.state.playerNum, activePlayer: this.state.activePlayer, inputAvailable: this.state.inputAvailable, screenInput: this.state.screenInput, buzzable: this.state.buzzable, buzzIn: this.buzzIn, submitAnswer: this.submitAnswer, typeAnswer: this.typeAnswer, answerInput: this.answerInput, input: this.input }}
              /> : null}
            <BoardComp board={this.board} activePlayer={this.state.activePlayer} activeScreen={this.state.activeScreen} playerNum={this.state.playerNum} screenSelect={this.screenSelect} history={this.props.history} />
          </div>
          <PlayerBar players={this.players} selectPlayer={this.selectPlayer} activePlayer={this.state.activePlayer} playerNum={this.state.playerNum} started={this.state.started} />
        </div>
      );
    }
  }
}