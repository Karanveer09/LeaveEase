const express = require('express');
const LeaveApplication = require('../models/LeaveApplication');
const auth = require('../middleware/auth');

const router = express.Router();

// Create leave application
router.post('/', auth, async (req, res) => {
  try {
    const { date, reason, lecturesOnLeave } = req.body;

    const leave = new LeaveApplication({
      applicant: req.user._id,
      date,
      reason,
      lecturesOnLeave
    });

    await leave.save();
    await leave.populate('applicant');

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user's leave applications
router.get('/my', auth, async (req, res) => {
  try {
    const leaves = await LeaveApplication.find({ applicant: req.user._id })
      .populate('applicant')
      .populate('lecturesOnLeave.coveredBy', 'name email department')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific leave application
router.get('/:id', auth, async (req, res) => {
  try {
    const leave = await LeaveApplication.findById(req.params.id)
      .populate('applicant')
      .populate('lecturesOnLeave.coveredBy', 'name email department');

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel leave application
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const leave = await LeaveApplication.findOne({
      _id: req.params.id,
      applicant: req.user._id
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
