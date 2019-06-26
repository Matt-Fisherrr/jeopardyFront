import React from 'react';
import { createRoom, getRoomList } from '../../connectionControllers/apiController'

export const RoomListMenuComp = ({auth, stateSetter, history}) => (
    <div className="roomListMenu">
        <button className="refreshButton" onClick={() => getRoomList(auth, stateSetter, history)}>↻</button>
        <input type="text" id="searchCreateInput" placeholder="Create room" maxLength='30' />
        <button onClick={e => createRoom(e, stateSetter, auth)}>Create Room</button>
    </div>
)