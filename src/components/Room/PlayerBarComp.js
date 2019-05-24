import React from 'react';

export const PlayerBar = ({players, selectPlayer, activatePlayer}) => {
  
  return(
    <div className="playerBarWrapper">
      <div 
        className="playerOne"
        style={(activatePlayer === 1)?{background:'#ccc'}:{}}
        onClick={() => selectPlayer("one")}
      >
        <h1>{players.playerOne}</h1>
        <h2>Score: {players.playerOneScore}</h2>
      </div>
      <div 
        className="playerTwo" 
        style={(activatePlayer === 2)?{background:'#ccc'}:{}}
        onClick={() => selectPlayer("Two")}
      >
        <h1>{players.playerTwo}</h1>
        <h2>Score: {players.playerTwoScore}</h2>
      </div>
      <div 
        className="playerThree" 
        style={(activatePlayer === 3)?{background:'#ccc'}:{}}
        onClick={() => selectPlayer("Three")}
      >
        <h1>{players.playerThree}</h1>
        <h2>Score: {players.playerThreeScore}</h2>
      </div>
    </div>
  )
}