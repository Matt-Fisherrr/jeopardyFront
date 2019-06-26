import openSocket from 'socket.io-client';

export default class socketController {
    constructor(auth, room, board, history, stateSetter) {
        this.socket = openSocket('https://jeopardybackend.herokuapp.com/jep')
        // this.socket = openSocket('http://localhost:5000/jep')

        this.setupEventResponses()

        this.stateSetter = stateSetter
        this.auth = auth
        this.history = history
        this.theBoard = null
        this.input = null

        // Room related
        this.room = room
        this.board = board
        this.started = 0
        this.buzzable = false

        // This player
        this.playerNum = 0
        this.activePlayer = 0
        this.ready = 0
        this.player_id = 0;

        // Board related
        this.screenText = ''
        this.activeScreen = ''
        this.screenInput = ''
        this.inputAvailable = true
        this.largeScreenTransition = 'all 0s'
        this.largeScreenX = 0
        this.largeScreenY = 0
        this.largeScreenHeight = 0
        this.largeScreenWidth = 0

        //All players
        this.players = {
            playerOne: "",
            playerOneScore: 0,
            playerOneReady: false,
            playerTwo: "",
            playerTwoScore: 0,
            playerTwoReady: false,
            playerThree: "",
            playerThreeScore: 0,
            playerThreeReady: false,
        }

        // Viewers
        this.viewers = 0

    }

    setupEventResponses() {

        this.socket.on('connect', () => {
            // console.log('connect')
            this.socket.emit('join_room', { room_id: this.room, access_token: this.auth.getAccessToken() })
        })

        this.socket.on('ping_check', (msg) => {
            // console.log('pinged')
            this.socket.emit('pong_res', { ping_num: msg.ping_num, access_token: this.auth.getAccessToken() })
        })

        this.socket.on('has_joined_room', (msg) => {
            // console.log('has_joined_room',msg)
            this.players = {
                ...this.players,
                playerOne: msg.players[1].username,
                playerOneScore: msg.players[1].score,
                playerOneReady: msg.players[1].ready,
                playerTwo: msg.players[2].username,
                playerTwoScore: msg.players[2].score,
                playerTwoReady: msg.players[2].ready,
                playerThree: msg.players[3].username,
                playerThreeScore: msg.players[3].score,
                playerThreeReady: msg.players[3].ready,
            }
            if (msg.started) {
                this.players = {
                    ...this.players,
                    playerOneReady: false,
                    playerTwoReady: false,
                    playerThreeReady: false,
                }
            }

            this.activePlayer = msg.active_player
            this.playerNum = (msg.position !== 0) ? msg.position : this.playerNum
            this.started = msg.started
            this.player_id = msg.player_id

            this.stateSetter()

            this.socket.emit('viewer_joined')
        })


        this.socket.on('viewer_added', (msg) => {
            console.log(`Viewers: ${msg.viewers}`)
            this.viewers = msg.viewers
        })

        this.socket.on('player_selected', (msg) => {
            if (msg.position === 1) {
                this.players = {
                    ...this.players,
                    playerOne: msg.username,
                }
            } else if (msg.position === 2) {
                this.players = {
                    ...this.players,
                    playerTwo: msg.username,
                }
            } else if (msg.position === 3) {
                this.players = {
                    ...this.players,
                    playerThree: msg.username,
                }
            }
            if (msg.player_id === this.player_id) {
                this.playerNum = msg.position
                this.stateSetter()
            } else {
                this.stateSetter()
            }
        })

        this.socket.on('ready_player', (msg) => {
            // console.log(msg)
            if (msg.position === 1) {
                this.players = {
                    ...this.players,
                    playerOneReady: msg.ready,
                }
            } else if (msg.position === 2) {
                this.players = {
                    ...this.players,
                    playerTwoReady: msg.ready,
                }
            } else if (msg.position === 3) {
                this.players = {
                    ...this.players,
                    playerThreeReady: msg.ready,
                }
            }
            if (this.playerNum === msg.position) {
                this.ready = msg.ready
                this.started = msg.started
            } else {
                this.started = msg.started
            }
            if (msg.started === 1) {
                this.players = {
                    ...this.players,
                    playerOneReady: false,
                    playerTwoReady: false,
                    playerThreeReady: false,
                }
                this.started = msg.started
                this.activePlayer = msg.active_player
            }
            this.stateSetter()
        })

        this.socket.on('screen_selected', (msg) => {
            // console.log(msg, this)
            const catName = Object.keys(this.board[msg.category])
            this.board[msg.category][catName][msg.clue]['answered'] = true
            const xAndY = msg.x_and_y.split(' ')

            this.activeScreen = msg.category + "|" + msg.clue
            this.screenText = msg.screen_text
            this.activePlayer = msg.active_player
            this.largeScreenTransition = 'all 0.5s'
            this.largeScreenX = xAndY[0] + 'px'
            this.largeScreenY = xAndY[1] + 'px'
            this.stateSetter()

            this.largeScreenHeight = 0
            this.largeScreenWidth = 0
            this.largeScreenTransition = 'all 1s'
            this.stateSetter()

            window.setTimeout(() => {
                this.largeScreenHeight = this.theBoard.children[0].offsetHeight
                this.largeScreenWidth = this.theBoard.offsetWidth
                this.largeScreenX = this.theBoard.offsetLeft
                this.largeScreenY = this.theBoard.offsetTop
                this.stateSetter()
            }, 500)
        })

        this.socket.on('buzzable', (msg) => {
            // console.log(msg,this.playerNum)
            if (msg.buzzable_players.includes(this.playerNum)) {
                this.buzzable = msg.buzz
            }
            this.stateSetter()
        })

        this.socket.on('fastest_buzz', (msg) => {
            // console.log('buzzed in: ',msg.buzzedIn)
            this.buzzable = false
            this.activePlayer = msg.buzzedIn
            this.inputAvailable = true
            this.stateSetter()
        })

        this.socket.on('no_buzz', (msg) => {
            // console.log('no buzz')
            const catclue = msg.screen_clicked.split("|")
            const catName = Object.keys(this.board[catclue[0]])
            this.board[catclue[0]][catName][catclue[1]].answered = true
            this.buzzable = false
            this.stateSetter()
        })

        this.socket.on('typed_answer', (msg) => {
            if (this.activePlayer !== this.playerNum) {
                this.screenInput = msg.answer_input
                this.stateSetter()
            }
        })

        this.socket.on('take_too_long', () => {
            this.socket.emit('answer_submit', { answer: this.screenInput })
        })

        this.socket.on('answer_response', (msg) => {
            // console.log(msg)
            if (msg.correct) {
                if (msg.position === 1) {
                    this.players = {
                        ...this.players,
                        playerOneScore: msg.new_score,
                    }
                } else if (msg.position === 2) {
                    this.players = {
                        ...this.players,
                        playerTwoScore: msg.new_score,
                    }
                } else if (msg.position === 3) {
                    this.players = {
                        ...this.players,
                        playerThreeScore: msg.new_score,
                    }
                }
                this.activePlayer = msg.position
                this.activeScreen = ''
                this.screenText = ''
                this.screenInput = ''
                this.stateSetter()
            } else {
                if (msg.position === 1) {
                    this.players = {
                        ...this.players,
                        playerOneScore: msg.new_score,
                    }
                } else if (msg.position === 2) {
                    this.players = {
                        ...this.players,
                        playerTwoScore: msg.new_score,
                    }
                } else if (msg.position === 3) {
                    this.players = {
                        ...this.players,
                        playerThreeScore: msg.new_score,
                    }
                }
                this.buzzable = false
                this.activePlayer = 0
                this.screenInput = ''
                this.stateSetter()
            }
        })


        this.socket.on('no_correct_answer', (msg) => {
            // console.log(msg)
            this.activePlayer = msg.position
            this.screenText = msg.answer
            this.activeScreen = ''
            this.screenInput = ''
            this.inputAvailable = false
            this.stateSetter()
            window.setTimeout(() => {
                this.screenText = ''
                this.stateSetter()
            }, 3000)
        })

        this.socket.on('winner', (msg) => {
            console.log(msg.username)
            if (Array.isArray(msg.username)) {
                const usernames = msg.username.join(', ')
                this.stateSetter({
                    loading: `Tie!\n${usernames}`
                })
            } else {
                this.stateSetter({
                    loading: `Winner!\n${msg.username}`
                })
            }
            this.socket.disconnect()
        })

        this.socket.on('error', () => {
            this.stateSetter({
                loading: 'Connection to server lost'
            })
            window.setTimeout(() => this.history.replace('/'), 100)
        })
    }

    selectPlayer = (pos) => {
        // console.log(pos)
        this.socket.emit('player_select', { access_token: this.auth.getAccessToken(), position: pos })
    }

    readyClick = () => {
        this.socket.emit('player_ready', { access_token: this.auth.getAccessToken() })
    }

    screenSelect = (e) => {
        const xAndY = e.target.offsetLeft + " " + e.target.offsetTop
        this.socket.emit('screen_select', { screen_clicked: e.target.id, x_and_y: xAndY })
    }

    answerInput = (e) => {
        // console.log(e.target,this.screenInput)
        this.screenInput = e.target.value
        this.socket.emit('answer_typed', { answer: e.target.value })
        this.stateSetter()
    }

    buzzIn = () => {
        // console.log('buzz in')
        this.buzzable = false
        this.stateSetter()
        this.socket.emit('buzz_in')
    }

    submitAnswer = () => {
        this.socket.emit('answer_submit', { answer: this.screenInput })
      }
}