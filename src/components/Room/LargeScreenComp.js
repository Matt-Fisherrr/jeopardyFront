import React from 'react';
import { ButtonOrInput } from './ButtonOrInput'

export const LargeScreenComp = ({ largeScreenY, largeScreenX, largeScreenWidth, largeScreenHeight, largeScreenTransition, screenText, htmlToReactParser, inputPass }) => {
  // console.log(htmlToReactParser.parse(screenText.replace(/\\/g, '')))
  return (
    <div
      className="largeScreenWrapper"
      style={{
        top: largeScreenY,
        left: largeScreenX,
        width: largeScreenWidth,
        height: largeScreenHeight,
        transition: largeScreenTransition,
      }}
    >
      <div className="largeScreenInnerWrapper">
        <div>
          <span>{htmlToReactParser.parse(screenText.replace(/\\/g, ''))}</span>
        </div>
        <ButtonOrInput inputPass={inputPass}/>
      </div>
    </div>
  )
}