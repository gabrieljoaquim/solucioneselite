const Verification = require('../models/verificationModel');

exports.uploadDocument = async (req, res) => {
  try {
    const { worker, type, url } = req.body;
    let verification = await Verification.findOne({ worker });
    if (!verification) {
      verification = new Verification({ worker, documents: [] });
    }
    verification.documents.push({ type, url });
    verification.status = 'pendiente';
    await verification.save();
    res.status(201).json(verification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.setStatus = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { status, reviewedBy } = req.body;
    const verification = await Verification.findOneAndUpdate(
      { worker: workerId },
      { status, reviewedBy, reviewedAt: new Date() },
      { new: true }
    );
    res.json(verification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getVerification = async (req, res) => {
  try {
    const { workerId } = req.params;
    const verification = await Verification.findOne({ worker: workerId });
    res.json(verification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
