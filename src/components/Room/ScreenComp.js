import React from 'react';

export const ScreenComp = (v, i) => {
  console.log(this)
  this.count2 += 200
  return (<li
    id={this.key.replace(/[^A-Za-z]/g, '') + '|' + i}
    key={this.key.replace(/[^A-Za-z]/g, '') + ' ' + i}
    className="boardColumnScreen"
    onClick={(this.activePlayer === this.playerNum) ? this.screenSelect : null}
    style={{
      ...(this.activePlayer === this.playerNum) ? (!v.answered) ? { cursor: 'pointer' } : { cursor: 'initial' } : { cursor: 'initial' },
      ...(this.activeScreen === this.key.replace(/[^A-Za-z]/g, '') + '|' + i) ? { background: '#025FA0' } : {},
      ...{ animationName: 'turn', animationDuration: '1s', animationIterationCount: 1, animationDelay: this.count1 + this.count2 + 'ms', animationFillMode: 'backwards' },
    }}
  >{(!v.answered) ? <span style={{ pointerEvents: 'none' }}>{v.value}</span> : null}</li>)
}