const Proposal = require('../models/Proposal');
const Gig = require('../models/Gig');
const { createNotification } = require('../utils/notifications');
let io;
exports.setIo = (_io) => { io = _io; };

exports.submitProposal = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.status !== 'open') return res.status(400).json({ success: false, message: 'Gig is not open' });
    const existing = await Proposal.findOne({ gig: req.params.gigId, freelancer: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already applied' });
    const proposal = await Proposal.create({ ...req.body, gig: req.params.gigId, freelancer: req.user._id });
    await Gig.findByIdAndUpdate(req.params.gigId, { $push: { proposals: proposal._id }, $inc: { proposalCount: 1 } });
    await proposal.populate('freelancer', 'name avatar rating skills');
    await createNotification(io, { user: gig.client, title: 'New Proposal', message: `${req.user.name} applied to your gig`, type: 'proposal', link: `/gigs/${gig._id}` });
    res.status(201).json({ success: true, proposal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getProposals = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    if (gig.client.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    const proposals = await Proposal.find({ gig: req.params.gigId }).populate('freelancer', 'name avatar rating skills location completedProjects').sort('-createdAt');
    res.json({ success: true, proposals });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateProposalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const proposal = await Proposal.findById(req.params.id).populate('gig');
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    const gig = proposal.gig;
    if (gig.client.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    proposal.status = status;
    await proposal.save();
    if (status === 'accepted') {
      await Gig.findByIdAndUpdate(gig._id, { status: 'in_progress', assignedFreelancer: proposal.freelancer });
      await createNotification(io, { user: proposal.freelancer, title: 'Proposal Accepted!', message: `Your proposal for "${gig.title}" was accepted!`, type: 'proposal', link: `/gigs/${gig._id}` });
    }
    res.json({ success: true, proposal });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id }).populate({ path: 'gig', populate: { path: 'client', select: 'name avatar' } }).sort('-createdAt');
    res.json({ success: true, proposals });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
