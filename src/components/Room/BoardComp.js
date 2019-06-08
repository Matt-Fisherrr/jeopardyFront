import React from 'react';

import { ScreenComp } from './ScreenComp'

export const BoardComp = ({ board, activePlayer, activeScreen, playernum }) => {
  // console.log(board)
  let count1 = 0
  const builtBoard = board.map((v, i) => {
    const title = Object.keys(v)[0]
    let count2 = 0
    count1 += 200
    return (<ul className="boardColumn">
      <li className="boardColumnTitle" key={title.replace(/[^A-Za-z]/g, '')}>{title}</li>
      {
        v[title].map(ScreenComp, {
          count1: count1,
          count2: count2,
          key: title,
          activePlayer: activePlayer,
          activeScreen: activeScreen,
          playernum: playernum
        })
      }
    </ul>)
  })
  return builtBoard
}