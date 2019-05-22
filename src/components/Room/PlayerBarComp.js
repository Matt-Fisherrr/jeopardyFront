import React from 'react';

export const PlayerBar = ({playerOne, playerOneScore, playerTwo, playerTwoScore, playerThree, playerThreeScore}) => {
  return(
    <div className="playerBarWrapper">
      <div className="playerOne">
        <h1>{playerOne}</h1>
        <h2>Score: {playerOneScore}</h2>
      </div>
      <div className="playerTwo">
        <h1>{playerTwo}</h1>
        <h2>Score: {playerTwoScore}</h2>
      </div>
      <div className="playerThree">
        <h1>{playerThree}</h1>
        <h2>Score: {playerThreeScore}</h2>
      </div>
    </div>
  )
}