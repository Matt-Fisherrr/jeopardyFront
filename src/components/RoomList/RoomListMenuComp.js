import React from 'react';
import { createRoom, getRoomList } from '../../connectionControllers/apiController'

export const RoomListMenuComp = ({auth, stateSetter}) => (
    <div className="roomListMenu">
        <button className="refreshButton" onClick={() => getRoomList(auth, stateSetter)}>↻</button>
        <input type="text" id="searchCreateInput" placeholder="Create room" maxLength='30' />
        <button onClick={e => createRoom(e, auth, stateSetter)}>Create Room</button>
    </div>
)