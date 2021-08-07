const chatMessages = []

function addMessage(room, sender, message) {
    chatMessages.push({room, sender, message})
    return {sender, message}
}

function getMessages(room) {
    const messages = []
    chatMessages.filter(chatMessages => chatMessages.room === room).forEach(chat => messages.push({sender: chat.sender, message: chat.message }))
    return messages
}

function deleteBotMessages(room) {
    const indexes = []
    chatMessages.forEach((msg, index) => {
        if(msg.room === room && msg.sender === 'bot')
            indexes.push(index)
    })
    indexes.reverse().forEach(idx => {
        chatMessages.splice(idx,1)
    })
}

function clearChat(room) {
  const indexes = []
  chatMessages.forEach((msg, index) => {
    if(msg.room === room)
      indexes.push(index)
  })
  indexes.reverse().forEach(idx => {
    chatMessages.splice(idx,1)
  })
}

module.exports = {
    addMessage,
    getMessages,
    deleteBotMessages,
    clearChat
}
