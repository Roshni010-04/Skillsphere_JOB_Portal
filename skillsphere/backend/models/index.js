// Re-export all models from their own files
// Use mongoose.models cache to prevent OverwriteModelError

module.exports = {
  Proposal: require('./Proposal'),
  Review: require('./Review'),
  Message: require('./Message'),
  Payment: require('./Payment'),
  Notification: require('./Notification'),
  Dispute: require('./Dispute'),
};
