import React from 'react';
import { Router, Route, Redirect } from "react-router-dom";
import Auth from './auth/Auth.js';
import history from './history';

import { Callback } from './components/CallbackComp'
import RoomList from './components/RoomList/RoomListComp'

import './main.css'

export const TopComp = () => {
  const auth = new Auth();
  const handleAuthentication = (nextState, replace) => {
    if (/access_token|id_token|error/.test(nextState.location.hash)) {
      auth.handleAuthentication();
    }
  }
  return (
    <Router history={history}>
      <div>
        <Route exact path="/" render={(props) => {
          return((auth.isAuthenticated())?
            <Redirect
              to={{
                pathname: "/rooms",
                state: { from: props.location }
              }}
            />
            :<Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
          );
        }} />
        <Route path="/login" render={() => auth.login()} />
        <Route path="/callback" render={(props) => {
          handleAuthentication(props);
          return <Callback history={history}/> 
        }}/>
        <Route path="/rooms" component={() => <RoomList auth={auth} history={history}/>} />
        <Route path="/logout" render={() => auth.logout()} />
      </div>
    </Router>
  );
}