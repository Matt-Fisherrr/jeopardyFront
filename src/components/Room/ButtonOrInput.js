import React from 'react';

export const buttonOrInput = () => {
  if(playerNum !== 0){
    if(activePlayer !== 0 && inputAvailable) {
      return(
        <>
          <input 
            type='text' 
            name='answer' 
            value={screenInput}
            ref={(ref) => this.input = ref}
            onChange={(activePlayer === this.numbers.indexOf(playerNum))?this.answerInput:(e) => this.setState({screenInput:e.target.value})}
          />
          {(this.numbers[activePlayer] === playerNum)?<button onClick={this.submitAnswer}>Submit</button>:null}
        </>
      )
    } else {
      if(buzzable){
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
      <div style={{color:'white', fontSize:'2em'}}>{screenInput}</div>
    )
  }
}