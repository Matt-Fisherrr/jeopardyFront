import React from 'react';

export const PlayerBar = ({players, selectPlayer, activePlayer, playerNum, started}) => {
  
  return(
    <div className="playerBarWrapper">
      <div 
        className="playerOne"
        style={(activePlayer === 1 || players.playerOneReady === true)?{background:'#ccc'}:(players.playerOne === '' && !started && playerNum === 0)?{cursor:'pointer'}:{}}
        onClick={() => selectPlayer("one")}
      >
        <h1>{players.playerOne}</h1>
        <h2>Score: {players.playerOneScore}</h2>
      </div>
      <div 
        className="playerTwo" 
        style={(activePlayer === 2 || players.playerTwoReady === true)?{background:'#ccc'}:(players.playerTwo === '' && !started && playerNum === 0)?{cursor:'pointer'}:{}}
        onClick={() => selectPlayer("two")}
      >
        <h1>{players.playerTwo}</h1>
        <h2>Score: {players.playerTwoScore}</h2>
      </div>
      <div 
        className="playerThree" 
        style={(activePlayer === 3 || players.playerThreeReady === true)?{background:'#ccc'}:(players.playerThree === '' && !started && playerNum === 0)?{cursor:'pointer'}:{}}
        onClick={() => selectPlayer("three")}
      >
        <h1>{players.playerThree}</h1>
        <h2>Score: {players.playerThreeScore}</h2>
      </div>
    </div>
  )
}