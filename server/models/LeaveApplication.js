const mongoose = require('mongoose');

const lectureOnLeaveSchema = new mongoose.Schema({
  slot: { type: Number, required: true, min: 1, max: 8 },
  subject: { type: String, required: true },
  covered: { type: Boolean, default: false },
  coveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { _id: false });

const leaveApplicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Leave date is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason for leave is required'],
    trim: true
  },
  lecturesOnLeave: [lectureOnLeaveSchema],
  status: {
    type: String,
    enum: ['pending', 'partially_covered', 'fully_covered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

// Virtual to check coverage status
leaveApplicationSchema.methods.updateCoverageStatus = function() {
  const totalLectures = this.lecturesOnLeave.length;
  const coveredLectures = this.lecturesOnLeave.filter(l => l.covered).length;
  
  if (coveredLectures === 0) {
    this.status = 'pending';
  } else if (coveredLectures < totalLectures) {
    this.status = 'partially_covered';
  } else {
    this.status = 'fully_covered';
  }
};

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);
