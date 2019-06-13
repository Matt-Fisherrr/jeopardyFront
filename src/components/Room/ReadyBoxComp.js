import React from 'react';

export const ReadyBox = ({ readyClick, ready }) => {
    return(
      <div className="readyWrapper">
        <button onClick={readyClick} style={(ready)?{background:'#025FA0', color:'white'}:null}>Ready</button>
      </div>
    );
  }