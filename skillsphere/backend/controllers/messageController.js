const Message = require('../models/Message');
const User = require('../models/User');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversation', lastMessage: { $first: '$$ROOT' } } },
      { $sort: { 'lastMessage.createdAt': -1 } }
    ]);
    const convs = await Promise.all(messages.map(async (m) => {
      const otherId = m.lastMessage.sender.toString() === userId ? m.lastMessage.receiver : m.lastMessage.sender;
      const other = await User.findById(otherId).select('name avatar role');
      const unread = await Message.countDocuments({ conversation: m._id, receiver: req.user._id, isRead: false });
      return { conversationId: m._id, lastMessage: m.lastMessage, other, unread };
    }));
    res.json({ success: true, conversations: convs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversation: conversationId }).populate('sender', 'name avatar').sort('createdAt');
    await Message.updateMany({ conversation: conversationId, receiver: req.user._id }, { isRead: true });
    res.json({ success: true, messages });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.sendMessage = async (req, res) => {
  try {
    const msg = await Message.create({ ...req.body, sender: req.user._id });
    await msg.populate('sender', 'name avatar');
    res.status(201).json({ success: true, message: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
