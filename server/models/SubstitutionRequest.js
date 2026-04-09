const mongoose = require('mongoose');

const substitutionRequestSchema = new mongoose.Schema({
  leaveApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveApplication',
    required: true
  },
  fromTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lectureSlot: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  subject: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('SubstitutionRequest', substitutionRequestSchema);
