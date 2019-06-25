import React from 'react';
import { checkUser } from '../connectionControllers/apiController'

export const UsernameBox = (props) => {
  let usernameInput = null
  return (
    <>
      <div className="usernameBox" style={(props.show) ? { width: '370px', padding: '30px' } : {}}>
        <h1>Enter Username:</h1>
        <div>
          <input type="text" placeholder="Username" maxLength='15' ref={b => usernameInput = b}></input>
          <button onClick={(e) => checkUser(usernameInput.value, props.auth, props.exitBox, props.stateSetter, props.history)}>✔</button>
          <button onClick={props.exitBox}>X</button>
        </div>
      </div>
      <div className="usernameBackground" style={(props.show) ? { display: 'initial' } : { display: 'none' }}></div>
    </>
  );
}