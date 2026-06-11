const Notification = require('../models/Notification');
exports.createNotification = async (io, { user, title, message, type, link, data }) => {
  const notif = await Notification.create({ user, title, message, type, link, data });
  if (io) io.to(`user_${user}`).emit('notification', notif);
  return notif;
};
