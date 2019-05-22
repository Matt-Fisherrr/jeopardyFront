import React from 'react';

export const Callback = ({history}) => {
  localStorage.setItem("timerKey",window.setTimeout(() => history.replace('/rooms?Redirected=1'),5000))
  return (
    <div>
      <h1>Redirecting to Rooms</h1>
    </div>
  );
}