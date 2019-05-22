import auth0 from 'auth0-js';
import history from '../history';

export default class Auth {

  auth0 = new auth0.WebAuth({
    domain: 'dev-0fw6q03t.auth0.com',
    clientID: '3eCEPx9I6Wr0N3FIJAwXXi5caFdRfZzV',
    redirectUri: 'http://localhost:3000/callback',
    responseType: 'token id_token',
    scope: 'openid',
    audience: 'localhost',
  });

  accessToken;
  idToken;
  expiresAt;

  login = () => {
    this.auth0.authorize();
  }

  handleAuthentication = () => {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        history.replace('/');
        console.log(err);
        // alert(`Error: ${err.error}. Check the console for further details.`);
        // this.logout()
      }
    });
  }

  getAccessToken = () => {
    return this.accessToken;
  }

  getIdToken = () => {
    return this.idToken;
  }

  setSession = (authResult) => {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');

    // Set the time that the Access Token will expire at
    let expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.expiresAt = expiresAt;

    // navigate to the home route
    history.replace('/rooms');
  }

  renewSession = () => {
    this.auth0.checkSession({}, (err, authResult) => {
       if (authResult && authResult.accessToken && authResult.idToken) {
         this.setSession(authResult);
       } else if (err) {
         this.logout();
         console.log(err);
        //  alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
       }
    });
  }

  logout = () => {
    // Remove tokens and expiry time
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');

    this.auth0.logout({
      returnTo: window.location.origin
    });

    // navigate to the home route
    // history.replace('/');
    window.location = "https://dev-0fw6q03t.auth0.com/v2/logout?returnTo=http%3A%2F%2Flocalhost%3A3000&client_id=3eCEPx9I6Wr0N3FIJAwXXi5caFdRfZzV"
  }

  isAuthenticated = () => {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = this.expiresAt;
    return new Date().getTime() < expiresAt;
  }
}