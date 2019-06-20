import React from 'react';

export const ScreenComp = (v, i, index, args) => {
  // console.log(args)
  return (<li
    id={index + '|' + i}
    key={args.key.replace(/[^A-Za-z]/g, '') + ((i+1) * (index+1))}
    className="boardColumnScreen"
    onClick={(args.activePlayer === args.playerNum && args.activePlayer !== 0 && args.playerNum !== 0) ? args.screenSelect : null}
    style={{
      ...(args.activePlayer === args.playerNum && args.activePlayer !== 0 && args.playerNum !== 0) ? (!v.answered) ? { cursor: 'pointer' } : { cursor: 'initial' } : { cursor: 'initial' },
      ...(args.activeScreen === args.key.replace(/[^A-Za-z]/g, '') + '|' + i) ? { background: '#025FA0' } : {},
      ...{ animationName: 'turn', animationDuration: '1s', animationIterationCount: 1, animationDelay: args.count1 + args.count2 + 'ms', animationFillMode: 'backwards' },
    }}
  >{(!v.answered) ? <span style={{ pointerEvents: 'none' }}>{v.value}</span> : null}</li>)
}