import React from 'react';

export const MenuComp = ({username, room, stateSetter, auth}) => (
    <div className="topMenu">
        <div id='dropdownWrapper'>
            ☰
              <ul className="dropdownMenu">
                <li>
                    <span>Username: {username}{(room === 0) ? <button className="editButton" onClick={() => stateSetter({ usernameNeeded: true })}>✏</button> : null}</span>
                </li>
                <li>
                    <button className="logOutButton" onClick={auth.logout} >Log Out</button>
                </li>
            </ul>
        </div>
    </div>
)