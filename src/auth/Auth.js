import auth0 from 'auth0-js';
import history from '../history';

export default class Auth {

  constructor() {
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = null;
    this.tokenRenewalTimeout = null;
    this.url = (window.location.hostname === "localhost")?"http://localhost:3000":'https://' + window.location.hostname;
    this.encodedurl = (window.location.hostname === "localhost")?"http%3A%2F%2Flocalhost%3A3000":"https%3A%2F%2F" + window.location.hostname;
    this.auth0 = new auth0.WebAuth({
      domain: 'dev-0fw6q03t.auth0.com',
      clientID: '3eCEPx9I6Wr0N3FIJAwXXi5caFdRfZzV',
      redirectUri: this.url + '/callback',
      responseType: 'token id_token',
      scope: 'openid',
      audience: 'localhost',
    })
    // this.renewSession()
    this.scheduleRenewal();
  }

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

    this.scheduleRenewal();

    // navigate to the home route
    history.replace('/rooms');
  }

  renewSession = (callback) => {
    // console.log('RenewSession')
    this.auth0.checkSession({}, callback);
  }

  logout = () => {
    // Remove tokens and expiry time
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');

    clearTimeout(this.tokenRenewalTimeout);

    this.auth0.logout({
      returnTo: window.location.origin
    });

    // navigate to the home route
    // history.replace('/');
    window.location = "https://dev-0fw6q03t.auth0.com/v2/logout?returnTo=" + this.encodedurl + "&client_id=3eCEPx9I6Wr0N3FIJAwXXi5caFdRfZzV"
  }

  isAuthenticated = () => {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = this.expiresAt;
    return new Date().getTime() < expiresAt;
  }

  scheduleRenewal() {
    let expiresAt = this.expiresAt;
    const timeout = expiresAt - Date.now();
    if (timeout > 0) {
      this.tokenRenewalTimeout = setTimeout(() => {
        this.renewSession();
      }, timeout);
    }
  }

  getExpiryDate() {
    return JSON.stringify(new Date(this.expiresAt));
  }
}