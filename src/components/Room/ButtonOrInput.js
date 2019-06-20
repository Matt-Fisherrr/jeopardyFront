import React from 'react';

export const ButtonOrInput = ({ socket }) => {
  if (socket.playerNum !== 0) {
    if (socket.activePlayer !== 0 && socket.inputAvailable) {
      return (
        <>
          <input
            type='text'
            name='answer'
            value={socket.screenInput}
            ref={(ref) => socket.input = ref}
            onChange={(socket.activePlayer === socket.playerNum) ? socket.answerInput : socket.typeAnswer}
          />
          {(socket.activePlayer === socket.playerNum) ? <button onClick={socket.submitAnswer}>Submit</button> : null}
        </>
      )
    } else {
      if (socket.buzzable) {
        return (
          <button onClick={socket.buzzIn} className='buzzButton'>Buzz In</button>
        )
      } else {
        return (
          <div></div>
        )
      }
    }
  } else {
    return (
      <div style={{ color: 'white', fontSize: '2em' }}>{socket.screenInput}</div>
    )
  }
}