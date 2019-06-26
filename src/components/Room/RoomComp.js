import React, { Component } from 'react';
import socketController from '../../connectionControllers/socketController'

import { PlayerBar } from './PlayerBarComp'
import { BoardComp } from './BoardComp'
import { LargeScreenComp } from './LargeScreenComp'
import { ReadyBox } from './ReadyBoxComp'

import { getBoard } from '../../connectionControllers/apiController'

const HtmlToReactParser = require('html-to-react').Parser;

export default class RoomList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      room: this.props.room,
      loading: 'Loading...',
      socket: null
    }

    this.board = null

    this.htmlToReactParser = new HtmlToReactParser();

    // Refs
    this.theBoard = null
    this.input = null
  }

  async componentDidMount() {
    this.board = await getBoard(this.stateSetter, this.props.auth, this.props.room, this.props.history)
    await this.setState({
      loading: '',
      socket: new socketController(this.props.auth, this.state.room, this.board, this.props.history, this.stateSetter)
    })
  }

  componentDidUpdate() {
    if (this.input) {
      this.input.focus()
    }
  }

  stateSetter = (state = { socket: this.state.socket }) => this.setState(state)

  typeAnswer = e => this.setState({ screenInput: e.target.value })

  theBoardRef = b => {
    const newsocket = this.state.socket
    newsocket.theBoard = b
  }

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
        <div className='inRoom' id='theBoard' ref={this.theBoardRef}>
          <div className="boardWrapper">
            {(this.state.socket.started === 0 && this.state.socket.playerNum !== 0) ? <ReadyBox readyClick={this.state.socket.readyClick} ready={this.state.socket.ready} /> : null}
            {(this.state.socket.screenText !== '') ?
              <LargeScreenComp socket={this.state.socket} htmlToReactParser={this.htmlToReactParser} /> : null}
            <BoardComp history={this.props.history} socket={this.state.socket} />
          </div>
          <PlayerBar socket={this.state.socket} />
        </div>
      );
    }
  }
}