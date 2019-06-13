import React, { Component } from 'react';
import { Router, Route, Redirect } from "react-router-dom";
import history from './history';

import { Callback } from './components/CallbackComp'
import RoomList from './components/RoomList/RoomListComp'

import './main.css'

export default class TopComp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      renew: true,
    }
  }

  componentDidMount() {
    this.props.auth.renewSession(this.renewCallback)
  }

  handleAuthentication = (nextState, replace) => {
    if (/access_token|id_token|error/.test(nextState.location.hash)) {
      this.props.auth.handleAuthentication();
    }
  }

  renewCallback = (err, authResult) => {
    if (authResult && authResult.accessToken && authResult.idToken) {
      // console.log("authresult", authResult)
      this.props.auth.setSession(authResult);
      this.setState({
        renew: false,
      })
    } else if (err) {
      this.props.auth.login()
      console.log(err);
      //  alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
    }
  }

  render() {
    if (this.state.renew) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: 'calc(100vh - 60px)' }}>
          <h1>Loading...</h1>
        </div>
      )
    }
    return (
      <Router history={history}>
        <Route exact path="/" render={(props) => (
          (this.props.auth.isAuthenticated()) ?
            <Redirect
              to={{
                pathname: "/rooms",
                state: { from: props.location }
              }}
            />
            : <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location }
              }}
            />
          )
        } />
        <Route path="/login" render={() => this.props.auth.login()} />
        <Route path="/callback" render={(props) => {
          this.handleAuthentication(props);
          return <Callback history={history} />
        }} />
        <Route path="/rooms" render={() => (this.props.auth.isAuthenticated())?<RoomList auth={this.props.auth} history={history} />:<Redirect to={{ pathname: "/login",}}/>} />
        <Route path="/logout" render={() => this.props.auth.logout()} />
      </Router>
    );
  }
}