import React from 'react';

export const ButtonOrInput = ({ inputPass }) => {
  let { playerNum, activePlayer, inputAvailable, screenInput, buzzable, buzzIn, submitAnswer, typeAnswer, answerInput, input} = inputPass
  if (playerNum !== 0) {
    if (activePlayer !== 0 && inputAvailable) {
      return (
        <>
          <input
            type='text'
            name='answer'
            value={screenInput}
            ref={(ref) => input = ref}
            onChange={(activePlayer === playerNum) ? answerInput : typeAnswer}
          />
          {(activePlayer === playerNum) ? <button onClick={submitAnswer}>Submit</button> : null}
        </>
      )
    } else {
      if (buzzable) {
        return (
          <button onClick={buzzIn} className='buzzButton'>Buzz In</button>
        )
      } else {
        return (
          <div></div>
        )
      }
    }
  } else {
    return (
      <div style={{ color: 'white', fontSize: '2em' }}>{screenInput}</div>
    )
  }
}