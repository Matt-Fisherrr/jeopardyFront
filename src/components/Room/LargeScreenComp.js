import React from 'react';
import { ButtonOrInput } from './ButtonOrInput'

export const LargeScreenComp = ({ socket , htmlToReactParser}) => {
  // console.log(htmlToReactParser.parse(screenText.replace(/\\/g, '')))
  return (
    <div
      className="largeScreenWrapper"
      style={{
        top: socket.largeScreenY,
        left: socket.largeScreenX,
        width: socket.largeScreenWidth,
        height: socket.largeScreenHeight,
        transition: socket.largeScreenTransition,
      }}
    >
      <div className="largeScreenInnerWrapper">
        <div>
          <span>{htmlToReactParser.parse(socket.screenText.replace(/\\/g, ''))}</span>
        </div>
        <ButtonOrInput socket={socket}/>
      </div>
    </div>
  )
}