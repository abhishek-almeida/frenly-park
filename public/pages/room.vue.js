const MusicApp = {
    data() {
        return {
            room: '',
            searchText: '',
            isPlaying: false,
            isLooping: false,
            isShuffled: false,
            song: {
                title: '',
                URL: '',
                time: 0
            },
            songs: [],
            downloadURL: ''
        }
    },


    mounted() {

        socket.on('getData', (user, song) => {
            const time = this.$refs.player.currentTime
            socket.emit('setData', user, song, time, this.isLooping, this.isShuffled)
        })

        socket.on('printQueue', songs => {
            this.songs = songs
        })
        socket.on('loopSong', loop => {
            this.isLooping = loop
            this.$refs.player.loop = loop
        })
        socket.on('shuffleSong', state => {
            this.isShuffled = state
        })
        socket.on('playSong', song => {
            this.song = song
            this.$refs.player.src = this.song.URL
            setTimeout(() => this.$refs.player.play(), 1000)
            this.$refs.player.currentTime = this.song.time    
        })
        socket.on('managePlay', state => {
            this.isPlaying = !state
            if(this.isPlaying)
                this.$refs.player.play()
            else
                this.$refs.player.pause()
            
        })

        socket.on('skipTime', time => {
            this.$refs.player.currentTime = time
        })

        socket.on('setSearchState', state => {
            this.$refs.searchBtn.disabled = state
        })
    },

    computed: {
        playState() {
            return this.isPlaying ? '⏸' : '▶'
        },
        queueEmpty() {
            return this.songs.length === 0 ? true : false
        },
        mode() {
            if(!this.isLooping && !this.isShuffled)
                return '🔁'
            else if(this.isLooping)
                return '🔂'
            else if(this.isShuffled)
                return '🔀'
        }
    },

    methods: {
        playOnAdd() {
            return this.songs.length ? true : false
        },
        checkState() {
            if(this.$refs.player.paused)
                this.isPlaying = false
            else 
                this.isPlaying = true
        },
        onSubmit() {
            socket.emit('addSong', this.searchText, this.playOnAdd())
            this.searchText = ''
            this.$refs.searchbox.focus()
            socket.emit('setSearchState', false)
        },
        changeSong(mode, shuffle) {
            socket.emit('play', mode, shuffle)
        },
        managePlay() {
            socket.emit('managePlay', this.isPlaying)
        },
        manageEnding() {
            if(!this.isLooping)
                this.changeSong('next', this.isShuffled)
        },
        changeMode() {
            if(!this.isLooping && !this.isShuffled)
                this.isLooping = true
            else if(this.isLooping) {
                this.isLooping = false
                this.isShuffled = true
            }
            else if(this.isShuffled)
                this.isShuffled = false
            socket.emit('loopSong', this.isLooping)
            socket.emit('shuffleSong', this.isShuffled)
        },
        downloadSong() {
            this.$refs.link.click()
        },
        playListItem(idx) {
            socket.emit('play', '', '', idx)
        },
        deleteListItem(idx) {
            socket.emit('removeSong', idx)
        },
        skipTime(val) {
            socket.emit('skipTime', this.$refs.player.currentTime + val)
        }
    },
 
    template: `
    <div id='music_app'>
        <form @submit.prevent="onSubmit">
            <input ref='searchbox' id='song_search' v-model="searchText" type="text" placeholder="Search for songs..." pattern="^.{1,75}$" required>
            <button class='submitBtn' ref="searchBtn" type="submit">Add!</button>
        </form>
        <audio preload
            ref="player"
            @ended="manageEnding"
            @paused="this.isPlaying = false"
            @timeupdate="checkState">
        </audio>



        <div id='queue'>
            <ul>
                <li v-for="(song, idx) in songs">
                    <button class='list_control_button' @click="playListItem(idx)">▶</button>
                    <span :class="{bold_title: song.title === this.song.title}">{{song.title}}</span>
                    <button class='list_control_button' @click="deleteListItem(idx)">❌</button>
                </li>
            </ul>
        </div>

        <div id='controls'>
        <div id='main_controls'>
        <button class='control_button' :disabled="queueEmpty" @click="changeSong('prev', this.isShuffled)">⏮</button>


        <button class='control_button' :disabled="queueEmpty" @click="skipTime(-10)">⏪</button>

        <button class='control_button' :disabled="queueEmpty" v-else @click="managePlay">{{playState}}</button>

        <button class='control_button' :disabled="queueEmpty" @click="skipTime(+10)">⏩</button>


        <button class='control_button' :disabled="queueEmpty" @click="changeSong('next', this.isShuffled)">⏭</button>
        </div>

        <div id='misc'>

        <button class='control_button' :disabled="queueEmpty" @click="changeMode">{{mode}}</button>

        <button class='control_button' :disabled="queueEmpty" @click="downloadSong">🔽</button>
        

        <a ref="link" :href="song.URL" target="_blank" download></a>
        </div>

        </div>
    `
}

const ChatApp = {
   data() {
       return {
           message: '',
           messages: [],
           itemRefs: []
       }
   },

   mounted() {
       socket.on('printChatLog', log => {
           this.messages = log
       })

       socket.on('chatMessage', ({ sender, message }) => {
           this.messages.push({ sender, message })
       })
   },

   methods: {
        onSubmit() {
            socket.emit('chatMessage', this.message)
            this.message = ''
            this.$refs.chat_input.focus()
            const test = this.$refs.test
            test.scrollTop = test.scrollHeight
        }
   },

   template: `
   <div id='chat_app'>
        <div ref='test' id='chat_box'>
            <ul>
                <li v-for="msg in messages">
                    <strong>{{msg.sender}}: </strong>
                    <span>{{msg.message}}</span>
                </li>
            </ul>         
        </div>

        <form @submit.prevent="onSubmit">
            <input ref='chat_input' v-model="message" type="text" pattern="(?!^ +$)^.+$" maxlength=280 required>
            <button class='submitBtn' type="submit">Send</button>
        </form>
    </div>
    `
}

const Room = {
    data() {
        return {
            invite: ''
        }
    },
    created() {
        socket.connect()
        socket.emit('join', this.$route.params.room, this.$route.query.user)
    },
    mounted() {
        this.invite = 'http://frenly-park.ddns.net/#/join/' +  this.$route.params.room
        socket.on('printUsers', users => {
            alert(users)
        })
        window.addEventListener('unload', this.leaveRoom)
    },
    unmounted() {
        socket.disconnect()
    },
    methods: {
        showMembers() {
            socket.emit('getUsers')
        },

        copyInvite() {
            this.$refs.inviteBox.select()
            document.execCommand("copy")
            alert('Invite copied to clipboard')
        },
        leaveRoom() {
            if(window.confirm('Do you really wish to leave?')) {
                socket.disconnect(true)
                window.location.href = "https://frenly-park.ddns.net"
            }
        }
    },
    components: {
        'MusicApp': MusicApp,
        'ChatApp': ChatApp
    },
    template: `
    <div id='room'>
        <div id='bar'>
            <h3>Frenly Park</h3>
            <div id='menu_buttons'>
                <button class='submitBtn' @click='showMembers'>Members</button>
                <button class='submitBtn' @click='leaveRoom'>Leave</button>
                <div id='invite_form'>
                <input ref='inviteBox' type='text' readonly :value='invite'>
                <button class='submitBtn' @click='copyInvite'>Invite</button>
                </div>
            </div>
        </div>
        <div id='main_app'>
            <MusicApp/>
            <hr>
            <ChatApp/>
        </div>
    </div>
    `,
    beforeRouteUpdate (to, from, next) {
        if(window.confirm('You will be redirected to the homepage. Continue?')) {
            socket.disconnect(true)
            window.location.href = "https://frenly-park.ddns.net"
        }
        else
            next(false)
    },
    beforeRouteLeave (to, from, next) {
        if(window.confirm('Do you really wish to leave?')) {
            socket.disconnect(true)
            window.location.href = "https://frenly-park.ddns.net"
        }
        else
            next(false)
    }
}
