import React from 'react';

export const PlayerBar = ({socket}) => {
  
  return(
    <div className="playerBarWrapper">
      <div 
        className="playerOne"
        style={(socket.activePlayer === 1 || socket.players.playerOneReady === true)?{background:'#494eef'}:(socket.players.playerOne === '' && !socket.started && socket.playerNum === 0)?{cursor:'pointer'}:{}}
        onClick={() => socket.selectPlayer(1)}
      >
        <h1>{socket.players.playerOne}</h1>
        <h2>Score: {socket.players.playerOneScore}</h2>
      </div>
      <div 
        className="playerTwo" 
        style={(socket.activePlayer === 2 || socket.players.playerTwoReady === true)?{background:'#494eef'}:(socket.players.playerTwo === '' && !socket.started && socket.playerNum === 0)?{cursor:'pointer'}:{}}
        onClick={() => socket.selectPlayer(2)}
      >
        <h1>{socket.players.playerTwo}</h1>
        <h2>Score: {socket.players.playerTwoScore}</h2>
      </div>
      <div 
        className="playerThree" 
        style={(socket.activePlayer === 3 || socket.players.playerThreeReady === true)?{background:'#494eef'}:(socket.players.playerThree === '' && !socket.started && socket.playerNum === 0)?{cursor:'pointer'}:{}}
        onClick={() => socket.selectPlayer(3)}
      >
        <h1>{socket.players.playerThree}</h1>
        <h2>Score: {socket.players.playerThreeScore}</h2>
      </div>
    </div>
  )
}