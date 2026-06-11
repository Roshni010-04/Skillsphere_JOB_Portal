const onlineUsers = new Map();
module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('join', (userId) => { socket.join(userId); onlineUsers.set(userId, socket.id); io.emit('user_online', userId); });
    socket.on('typing', (data) => socket.to(data.receiverId).emit('typing', { senderId: data.senderId }));
    socket.on('stop_typing', (data) => socket.to(data.receiverId).emit('stop_typing', { senderId: data.senderId }));
    socket.on('disconnect', () => { for (const [uid, sid] of onlineUsers.entries()) { if (sid === socket.id) { onlineUsers.delete(uid); io.emit('user_offline', uid); break; } } });
  });
};
