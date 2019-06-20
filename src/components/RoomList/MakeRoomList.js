import React from 'react';
import { Link } from "react-router-dom";

export const MakeRoomList = ({ roomlist, stateSetter }) => {
    try {
        return roomlist.map((v, i) => {
            return (
                <li key={v + i} style={(v.old) ? { background: '#025FA0' } : null}>
                    <Link to={"/rooms/" + v.id} key={v + i} onClick={(e) => stateSetter({ room: v.id })}>{
                        <>
                            <h1 className="roomListName">{v.name}</h1>
                            <h1 className="roomListPlayers">{(v.players !== 'started') ? "Players:" + v.players + "/3" : "Started"}</h1>
                        </>
                    }</Link>
                </li>
            )
        })
    } catch (e) {
        console.log(e)
    }
}