const express = require('express')
const app = express()
const server = require('http').createServer(app)
const PORT = 5000
const { Server } = require('socket.io')
const io = new Server(server)
const path = require('path')
const { exec } = require('child_process')
const yt = require('scrape-youtube').youtube
const users = require('./users')
const messages = require('./messages')
const songQueue = require('./queue')
const song =   require('./song')

io.on('connection', (socket) => {
  socket.on('join', (room, username) => {
    const user = users.userJoin(socket.id, room, username)
    socket.join(user.room)
    socket.emit('printChatLog', messages.getMessages(user.room))
    var msg = messages.addMessage(user.room, 'bot', user.username + ' is here!')
    io.to(user.room).emit('chatMessage', msg)
    socket.on('chatMessage', message => {
      msg = messages.addMessage(user.room, user.username, message)
      io.to(user.room).emit('chatMessage', msg)
    })
    setTimeout(() => fixChat(user.room), 10000)
    socket.emit('printQueue', songQueue.getSongs(user.room))
    const current = song.getSongData(user.room)
    if(typeof(current) !== 'undefined') {
      socket.to(user.room).emit('getData', user.id, current.song)
    }
    socket.on('setData', (userX, song, time, loop, shuffle) => {
      song.time = time + 1
      if(songQueue.getSongs(user.room).length)
        io.to(userX).emit('playSong', song)
      io.to(userX).emit('loopSong', loop)
      io.to(userX).emit('shuffleSong', shuffle)
    })
    socket.on('addSong', (search, state) => {
      io.to(user.room).emit('setSearchState', true)
      setTimeout(() => io.to(user.room).emit('setSearchState', false), 10000)
      yt.search(search).then(res => {
        if(res.videos.length) {     
          exec('youtube-dl -f 140 -g -- ' + res.videos[0].id , (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`)
              return
            }
            songQueue.addSong(user.room, res.videos[0].title, search, stdout)
            const songs = songQueue.getSongs(user.room)
            io.to(user.room).emit('printQueue', songs)
            if(!state) {
              song.setSong(user.room)
              changeSong(user.room, songs, 'next', false)
            }
          })
        }
      })
    })

    socket.on('loopSong', loop => {
      io.to(user.room).emit('loopSong', loop)
    })
    socket.on('shuffleSong', shuffle => {
      const current = song.getSongData(user.room)
      current.shuffle = shuffle
      io.to(user.room).emit('shuffleSong', shuffle)
    })
    socket.on('play', (mode, shuffle, idx) => {
      const songs = songQueue.getSongs(user.room)
      if(songs.length)
        changeSong(user.room, songs, mode, shuffle, idx)  
    })
    socket.on('removeSong', idx => {
      songQueue.removeSong(user.room, idx)
      const songs = songQueue.getSongs(user.room)
      const current = song.getSongData(user.room)
      if(current.index === idx) {
        current.index--
        if(!songs.length)
          io.to(user.room).emit('managePlay', true)
        else
          changeSong(user.room, songs, 'next', current.shuffle)
      }
      else if(current.index > idx)
            current.index--
      io.to(room).emit('printQueue', songs)
    })
    socket.on('managePlay', state => {
      io.to(user.room).emit('managePlay', state)
    })
    socket.on('skipTime', time => {
      io.to(user.room).emit('skipTime', time)
    })
    socket.on('getUsers', () => {
      socket.emit('printUsers', users.getRoomUsers(user.room))
    })
    socket.on('disconnect', () => {
      users.removeUser(socket.id)
      msg = messages.addMessage(user.room, 'bot', user.username + ' has left!')
      io.to(user.room).emit('chatMessage', msg)
      if(users.getRoomUsers(room).length == 0) {
	songQueue.clearQueue(room)
	messages.clearChat(room)
	song.clearSong(room)
      }
    })
  })
})

function changeSong(room, songs, mode, shuffle, idx) {
  const current = song.getSongData(room)
  if(mode === 'next') {
    if(shuffle) {
      current.index = Math.floor(Math.random() * songs.length)
    }
    else {
      current.index++
      if(current.index > songs.length - 1)
        current.index = 0
    }
  }
  else if(mode === 'prev') {
    if(shuffle) {
      current.index = Math.floor(Math.random() * songs.length)
    }
    else {
      current.index--
      if(current.index < 0)
        current.index = songs.length - 1
    }
  }
  else if(typeof(idx) !== 'undefined')
    current.index = idx
  current.shuffle = shuffle
  current.song = {
    title: songs[current.index].title,
    URL: songs[current.index].URL,
    time:0
  }
  io.to(room).emit('printQueue', songs)
  io.to(room).emit('playSong', current.song)
}

function fixChat(room) {
  messages.deleteBotMessages(room)
  io.to(room).emit('printChatLog', messages.getMessages(room))
}

app.use(express.static(path.join(__dirname, 'public')))
server.listen(PORT, () => console.log('listening...'))
