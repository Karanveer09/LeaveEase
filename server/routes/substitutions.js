const express = require('express');
const SubstitutionRequest = require('../models/SubstitutionRequest');
const LeaveApplication = require('../models/LeaveApplication');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Send substitution request
router.post('/', auth, async (req, res) => {
  try {
    const { leaveApplicationId, toTeacherId, lectureSlot, subject, date } = req.body;

    // Verify leave application exists and belongs to current user
    const leave = await LeaveApplication.findOne({
      _id: leaveApplicationId,
      applicant: req.user._id
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    // Check if there's already a pending or accepted request for this slot to the same teacher
    const existingRequest = await SubstitutionRequest.findOne({
      leaveApplication: leaveApplicationId,
      toTeacher: toTeacherId,
      lectureSlot,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A request already exists for this teacher and slot' });
    }

    // Check if this slot is already covered
    const acceptedRequest = await SubstitutionRequest.findOne({
      leaveApplication: leaveApplicationId,
      lectureSlot,
      status: 'accepted'
    });

    if (acceptedRequest) {
      return res.status(400).json({ message: 'This lecture slot is already covered' });
    }

    const substitutionRequest = new SubstitutionRequest({
      leaveApplication: leaveApplicationId,
      fromTeacher: req.user._id,
      toTeacher: toTeacherId,
      lectureSlot,
      subject,
      date
    });

    await substitutionRequest.save();
    await substitutionRequest.populate('fromTeacher toTeacher', 'name email department');

    res.status(201).json(substitutionRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get incoming substitution requests (requests sent TO current user)
router.get('/incoming', auth, async (req, res) => {
  try {
    const requests = await SubstitutionRequest.find({ toTeacher: req.user._id })
      .populate('fromTeacher', 'name email department')
      .populate('toTeacher', 'name email department')
      .populate('leaveApplication')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get outgoing substitution requests for a specific leave
router.get('/outgoing/:leaveId', auth, async (req, res) => {
  try {
    const requests = await SubstitutionRequest.find({
      leaveApplication: req.params.leaveId,
      fromTeacher: req.user._id
    })
      .populate('fromTeacher', 'name email department')
      .populate('toTeacher', 'name email department')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept substitution request
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const request = await SubstitutionRequest.findOne({
      _id: req.params.id,
      toTeacher: req.user._id,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    // Check if slot is already covered by someone else
    const alreadyCovered = await SubstitutionRequest.findOne({
      leaveApplication: request.leaveApplication,
      lectureSlot: request.lectureSlot,
      status: 'accepted'
    });

    if (alreadyCovered) {
      request.status = 'rejected';
      request.rejectionReason = 'Slot already covered by another teacher';
      await request.save();
      return res.status(400).json({ message: 'This slot has already been covered by another teacher' });
    }

    request.status = 'accepted';
    await request.save();

    // Update the leave application to mark this lecture as covered
    const leave = await LeaveApplication.findById(request.leaveApplication);
    if (leave) {
      const lectureIndex = leave.lecturesOnLeave.findIndex(l => l.slot === request.lectureSlot);
      if (lectureIndex !== -1) {
        leave.lecturesOnLeave[lectureIndex].covered = true;
        leave.lecturesOnLeave[lectureIndex].coveredBy = req.user._id;
        leave.updateCoverageStatus();
        await leave.save();
      }
    }

    // Reject all other pending requests for the same slot
    await SubstitutionRequest.updateMany(
      {
        leaveApplication: request.leaveApplication,
        lectureSlot: request.lectureSlot,
        _id: { $ne: request._id },
        status: 'pending'
      },
      {
        status: 'rejected',
        rejectionReason: 'Slot covered by another teacher'
      }
    );

    await request.populate('fromTeacher toTeacher', 'name email department');

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject substitution request
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const request = await SubstitutionRequest.findOne({
      _id: req.params.id,
      toTeacher: req.user._id,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found or already processed' });
    }

    request.status = 'rejected';
    request.rejectionReason = rejectionReason || 'No reason provided';
    await request.save();

    await request.populate('fromTeacher toTeacher', 'name email department');

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get available teachers for a specific date and slot
router.get('/available-teachers', auth, async (req, res) => {
  try {
    const { date, slot } = req.query;

    if (!date || !slot) {
      return res.status(400).json({ message: 'Date and slot are required' });
    }

    const leaveDate = new Date(date);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[leaveDate.getDay()];
    const slotNum = parseInt(slot);

    // Get all teachers except current user
    const allTeachers = await User.find({ _id: { $ne: req.user._id } }).select('-password');

    // Filter teachers who don't have their own lecture at this slot on this day
    const availableTeachers = allTeachers.filter(teacher => {
      const daySchedule = teacher.timetable?.[dayName] || [];
      const hasLecture = daySchedule.some(l => l.slot === slotNum);
      return !hasLecture;
    });

    // Also filter out teachers who have already accepted a substitution at this slot on this date
    const acceptedSubs = await SubstitutionRequest.find({
      date: {
        $gte: new Date(leaveDate.setHours(0, 0, 0, 0)),
        $lt: new Date(leaveDate.setHours(23, 59, 59, 999))
      },
      lectureSlot: slotNum,
      status: 'accepted'
    });

    const busyTeacherIds = acceptedSubs.map(s => s.toTeacher.toString());

    const finalAvailable = availableTeachers.filter(
      t => !busyTeacherIds.includes(t._id.toString())
    );

    res.json(finalAvailable);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
