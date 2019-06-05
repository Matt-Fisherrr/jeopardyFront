import React from 'react';

export const LargeScreenComp = ({ largeScreenY, largeScreenX, largeScreenWidth, largeScreenHeight, largeScreenTransition, screenText, htmlToReactParser }) => {
  // console.log(screenText.replace(/\\/g,''))
  return (
    <div
      className="largeScreenWrapper"
      style={{
        top: largeScreenY,
        left: largeScreenX,
        width: largeScreenWidth,
        height: largeScreenHeight,
        transition: largeScreenTransition,
      }}>
      <div className="largeScreenInnerWrapper">
        <div>
          <span>{htmlToReactParser.parse(screenText.replace(/\\/g, ''))}</span>
        </div>
        {this.buttonOrInput()}
      </div>
    </div>
  )
}