import React from 'react';

import { ScreenComp } from './ScreenComp'

export const BoardComp = ({ board, activePlayer, activeScreen, playerNum, screenSelect }) => {
  // console.log(playerNum)
  try{
  let count1 = 0
  const builtBoard = board.map((v, index) => {
    const title = Object.keys(v)[0]
    let count2 = 0
    count1 += 200
    return (<ul className="boardColumn">
      <li className="boardColumnTitle" key={title.replace(/[^A-Za-z]/g, '')}>{title}</li>
      {
        v[title].map((v, i) => {
          count2 += 200
          return ScreenComp(v, i, index, {
            count1: count1,
            count2: count2,
            key: title,
            activePlayer: activePlayer,
            activeScreen: activeScreen,
            playerNum: playerNum,
            screenSelect:screenSelect
          })
        }
        )
      }
    </ul>)
  })
  return builtBoard
} catch {
  window.setTimeout(() => this.props.history.replace('/'), 100)
}
}