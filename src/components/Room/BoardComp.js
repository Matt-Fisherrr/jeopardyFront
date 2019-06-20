import React from 'react';

import { ScreenComp } from './ScreenComp'

export const BoardComp = ({ socket, history }) => {
  // console.log(playerNum)
  try {
    let count1 = 0
    const builtBoard = socket.board.map((v, index) => {
      const title = Object.keys(v)[0]
      let count2 = 0
      count1 += 200
      return (<ul className="boardColumn">
        <li className="boardColumnTitle" key={index+2 * index+1}>{title}</li>
        {
          v[title].map((v, i) => {
            count2 += 200
            return ScreenComp(v, i, index, {
              count1: count1,
              count2: count2,
              key: title,
              activePlayer: socket.activePlayer,
              activeScreen: socket.activeScreen,
              playerNum: socket.playerNum,
              screenSelect: socket.screenSelect
            })
          }
          )
        }
      </ul>)
    })
    return builtBoard
  } catch {
    window.setTimeout(() => history.replace('/'), 100)
    return (<div></div>)
  }
}