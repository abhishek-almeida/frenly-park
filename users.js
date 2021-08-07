const users = []

function userJoin(id, room, username) {
    const user = {id, room, username}
    users.push(user);
    return user;
}

function getRoomUsers(room) {
    const roomUsers = []
    users.filter(user => user.room === room).forEach(user => roomUsers.push(user.username))
    return roomUsers
}

function removeUser(id) {
    users.forEach((user, idx) => {
        if(user.id === id)
            users.splice(idx, 1)
    })
}

module.exports = {
    userJoin,
    getRoomUsers,
    removeUser,
}
