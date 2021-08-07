const queue = []

function addSong(room, title, searchText, URL) {
    queue.push({room, title, searchText, URL})
}

function getSongs(room) {
    return queue.filter(song => song.room === room)
}

function removeSong(room, idx) {
    const indexes = []
    queue.forEach((song, index) => {
        if(song.room === room)
            indexes.push(index)
    })
    queue.splice(indexes.indexOf(idx), 1)
}

function clearQueue(room) {
  const indexes = []
  queue.forEach((song, index) => {
    if(song.room === room)
      indexes.push(index)
  })
  indexes.reverse().forEach(idx => {
    queue.splice(idx,1)
  })
}

module.exports = {
    addSong,
    getSongs,
    removeSong,
    clearQueue
}
