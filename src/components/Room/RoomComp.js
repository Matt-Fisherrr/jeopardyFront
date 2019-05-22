import React, { Component } from 'react';
import axios from 'axios';

import { PlayerBar } from './PlayerBarComp'

export default class RoomList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      room: this.props.room,
      board: {},
      loading: 'Loading...',
    }
    this.players = {
      playerOne: "",
      playerOneScore: 0,
      playerTwo: "",
      playerTwoScore: 0,
      playerThree: "",
      playerThreeScore: 0,
    }
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
      })
      .catch(error => {
        console.log(error)
        this.setState({
          loading: 'Error, see console'
        })
      })
  }

  createBoard = () => {
    console.log(this.state.board)
    let board = []
    for (let key in this.state.board) {
      board.push(<ul className="boardColumn">
        <li className="boardColumnTitle" key={key.replace(/[^A-Za-z]/g,'')}>{key}</li>
        {this.state.board[key].map((v) => <li id={key.replace(/[^A-Za-z]/g,'') + v.value} key={key.replace(/[^A-Za-z]/g,'') + v.value} className="boardColumnScreen">{v.value}</li>)}
      </ul>)
    }
    return board
  }

  render() {
    if (this.state.loading !== '') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }}>
          <h1>{this.state.loading}</h1>
        </div>
      );
    }

    return (
      <>
        <div className="boardWrapper">
          {this.createBoard()}
        </div>
        <PlayerBar players={this.players} />
      </>
    );
  }
}