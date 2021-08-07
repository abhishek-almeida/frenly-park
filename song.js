const currentSong = []

function setSong(room) {
    currentSong.push({room, song: {title: '', URL: '', time: 0}, index: -1, shuffle: false})
}

function getSongData(room) {
    return currentSong.find(x => x.room === room)
}

function clearSong(room) {
  currentSong.forEach((song, index) => {
    if(song.room === room)
      currentSong.splice(index,1)
  })
}

module.exports = {
    setSong,
    getSongData,
    clearSong
}
