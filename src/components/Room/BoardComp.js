import React from 'react';

import { ScreenComp } from './ScreenComp'

export const BoardComp = ({ board, activePlayer, activeScreen, playernum }) => {
  let builtBoard = []
  let count1 = 0
  for (let key in board) {
    let count2 = 0
    builtBoard.push(<ul className="boardColumn">
      <li className="boardColumnTitle" key={key.replace(/[^A-Za-z]/g, '')}>{board[key][0].category}</li>
      {
        board[key].map(ScreenComp, {
          count1: count1, 
          count2:count2,
          key:key,
          activePlayer:activePlayer,
          activeScreen:activeScreen,
          playernum:playernum
        })
      }
    </ul>)
    count1 += 200
  }
  return board
}