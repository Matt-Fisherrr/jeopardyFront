import React from 'react';
import axios from 'axios';
import { Redirect } from "react-router-dom";

const API_URL = 'https://jeopardybackend.herokuapp.com/api'
// const API_URL = 'http://localhost:5000/api'

export const getBoard = async (stateSetter, auth, room) => {
    const { getAccessToken } = auth;
    const headers = { 'Authorization': `Bearer ${getAccessToken()}`, 'room_id': room }
    let res = ''
    await axios.get(`${API_URL}/roomlist/getboard`, { headers })
        .then(response => {
            res = response.data.board
        })
        .catch(error => {
            res = error
            console.log(error)
            stateSetter({
                loading: 'Error, see console'
            })
        })
    return res
}

export const connect = async (stateSetter, auth, history) => {
    const { getAccessToken, getIdToken } = auth;
    const headers = { 'Authorization': `Bearer ${getAccessToken()}` }
    const data = { IDToken: getIdToken() }
    // console.log("Connect")
    await axios.post(`${API_URL}/connect`, data, { headers })
        .then(response => {
            if (response.data.response === true) {
                stateSetter({
                    authorized: true,
                    username: response.data.username,
                    loading: '',
                })
            } else if (response.data.response === "username") {
                stateSetter({
                    authorized: true,
                    usernameNeeded: true,
                    username: '',
                    loading: '',
                })
            }
        })
        .catch(error => {
            console.log("connect: ", error)
            window.setTimeout(() => history.replace('/'), 1000)
            stateSetter({ loading: "Error, redirecting..." })
        })
}

export const checkUser = (username, auth, exitBox, stateSetter, history) => {
    const { getAccessToken } = auth;
    const headers = { 'Authorization': `Bearer ${getAccessToken()}` }
    const data = { user: username }
    axios.post(`${API_URL}/connect/reg`, data, { headers })
        .then(response => {
            exitBox()
            stateSetter({
                username: response.data.username
            })
        })
        .catch(error => {
            console.log(error)
            window.setTimeout(() => history.replace('/'), 1000)
            stateSetter({ loading: "Error, redirecting..." })
        })
}

export const getRoomList = (auth, stateSetter, history) => {
    const { getAccessToken } = auth;
    const headers = { 'Authorization': `Bearer ${getAccessToken()}` }
    axios.get(`${API_URL}/roomlist`, { headers })
        .then(response => {
            stateSetter({ roomlist: response.data })
        })
        .catch(error => {
            console.log(error)
            window.setTimeout(() => history.replace('/'), 1000)
            stateSetter({ loading: "Error, redirecting..." })
        })
}

export const createRoom = (e, stateSetter, auth) => {
    stateSetter({
      loading: 'Loading...'
    })
    const { getAccessToken } = auth;
    const headers = { 'Authorization': `Bearer ${getAccessToken()}` }
    const data = { roomName: e.target.parentNode.children.searchCreateInput.value }
    axios.post(`${API_URL}/roomlist/create`, data, { headers })
      .then(response => {
        stateSetter({
          room: response.data.room_id,
          loading: '',
        })
        return <Redirect to={`/rooms/${response.data.room_id}`} />
      })
      .catch(error => {
        console.log(error)
        stateSetter({
          loading: 'Error, see console'
        })
      })
  }