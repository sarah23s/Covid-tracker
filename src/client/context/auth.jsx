import auth0 from 'auth0-js'
import { toast } from 'react-toastify';

const DOMAIN = import.meta.env.VITE_AUTH0_DOMAIN
const CLIENT_ID = import.meta.env.VITE_AUTH0_CLIENT_ID
const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE
const SCOPE = import.meta.env.VITE_AUTH0_SCOPE
const REALM = import.meta.env.VITE_AUTH_REALM
const LOGIN_URL = import.meta.env.VITE_LOGIN_URI
const LOGOUT_URL = import.meta.env.VITE_LOGOUT_URI
const RESPONSE_TYPE = import.meta.env.VITE_LOGIN_RESPONSE_TYPE

export const webAuth = new auth0.WebAuth({
  domain: DOMAIN,
  clientID: CLIENT_ID,
  audience: AUDIENCE,
  scope: SCOPE,
});

export const signup = (email, password) => {
  webAuth.signup({
    email: email,
    password: password,
    connection: REALM,
  }, function (error, result) {
    if (error) return toast.error(`Incorrect email or password!`);
  })
}

export const login = (email, password) => {
  webAuth.login({
    username: email,
    password: password,
    realm: REALM,
    redirectUri: LOGIN_URL,
    responseType: RESPONSE_TYPE,
  }, function (error, result) {
    if (error) return toast.error(`Incorrect email or password!`);
  })
}

export const logout = () => {
  webAuth.logout({
    returnTo: LOGOUT_URL,
    clientID: CLIENT_ID,
  }, function (error, result) {
    if (error) {
      return toast.error(`Sorry, an error occurred`);
    }
  })
}