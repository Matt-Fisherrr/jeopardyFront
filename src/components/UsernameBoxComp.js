import React from 'react';

export const UsernameBox = (props) => {
  return(
    <div className="usernameBox" style={(props.show)?{width:'370px',padding:'30px'}:{}}>
      <input type="text" id="usernameInput" placeholder="Username" maxLength='15'></input>
      <button onClick={(e) => props.checkUser(e.target.parentNode.children.usernameInput.value)}>✔</button>
      <button onClick={props.exitBox}>X</button>
    </div>
  );
}