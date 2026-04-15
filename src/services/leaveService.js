import { localCollection } from '../utils/localDb';
import { getCurrentUserProfile } from './authService';
import { cancelRequestsBySlot } from './substitutionService';


const leavesCollection = localCollection('leaves');

// Create leave application
export const createLeave = async (applicantId, leaveData) => {
  const { date, reason, lecturesOnLeave } = leaveData;
  
  // Prevent duplicate leave applications for the same LECTURE SLOTS on the same date
  const activeLeavesToday = leavesCollection.getAll().filter(l => 
    l.applicantId === applicantId && 
    l.date === date && 
    l.status !== 'cancelled'
  );

  const existingSlots = activeLeavesToday.flatMap(l => l.lecturesOnLeave.filter(lec => !lec.cancelled).map(lec => lec.slot));
  const newSlots = lecturesOnLeave.map(l => l.slot);
  
  const overlap = newSlots.filter(s => existingSlots.includes(s));
  
  // Check for an existing active leave to merge with
  const existingActiveLeave = activeLeavesToday[0]; // Take the first one if multiple exist (should be only one)

  if (existingActiveLeave) {
    const updatedLectures = [
      ...existingActiveLeave.lecturesOnLeave,
      ...lecturesOnLeave.map(l => ({ ...l, covered: false, coveredById: null, cancelled: false }))
    ];

    // Recalculate status based on all slots
    const totalSlots = updatedLectures.filter(l => !l.cancelled).length;
    const coveredSlots = updatedLectures.filter(l => !l.cancelled && l.covered).length;
    
    let newStatus = 'pending';
    if (coveredSlots === totalSlots && totalSlots > 0) newStatus = 'fully_covered';
    else if (coveredSlots > 0) newStatus = 'partially_covered';

    leavesCollection.update(existingActiveLeave._id, {
      lecturesOnLeave: updatedLectures,
      status: newStatus,
      // Update reason if it was empty or just append if desired? 
      // User didn't specify, I'll keep the original reason or combine them
      reason: existingActiveLeave.reason + (reason ? ` | ${reason}` : '')
    });

    return await getLeaveById(existingActiveLeave._id);
  }

  const savedLeave = leavesCollection.add({

    applicantId,
    date,
    reason,
    lecturesOnLeave: lecturesOnLeave.map(l => ({ ...l, covered: false, coveredById: null, cancelled: false })),
    status: 'pending',
    createdAt: new Date().toISOString()
  });


  return await getLeaveById(savedLeave._id);
};

// Get current user's leave applications
export const getMyLeaves = async (userId) => {
  const allLeaves = leavesCollection.getAll();
  const myLeaves = allLeaves.filter(l => l.applicantId === userId);
  
  const leaves = [];
  
  for (const leave of myLeaves) {
    const leaveCopy = { ...leave };
    // Populate applicant
    const applicant = await getCurrentUserProfile(leaveCopy.applicantId);
    leaveCopy.applicant = applicant;
    
    // Populate coveredBy for each lecture
    for (let i = 0; i < leaveCopy.lecturesOnLeave.length; i++) {
      if (leaveCopy.lecturesOnLeave[i].coveredById) {
        const coveredBy = await getCurrentUserProfile(leaveCopy.lecturesOnLeave[i].coveredById);
        leaveCopy.lecturesOnLeave[i].coveredBy = coveredBy;
      }
    }
    
    leaves.push(leaveCopy);
  }
  
  return leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Get ALL leaves (Admin)
export const getAllLeaves = async () => {
  const allLeaves = leavesCollection.getAll();
  const leaves = [];

  for (const leave of allLeaves) {
    const leaveCopy = { ...leave };
    const applicant = await getCurrentUserProfile(leaveCopy.applicantId);
    leaveCopy.applicant = applicant;

    for (let i = 0; i < leaveCopy.lecturesOnLeave.length; i++) {
      if (leaveCopy.lecturesOnLeave[i].coveredById) {
        const coveredBy = await getCurrentUserProfile(leaveCopy.lecturesOnLeave[i].coveredById);
        leaveCopy.lecturesOnLeave[i].coveredBy = coveredBy;
      }
    }

    leaves.push(leaveCopy);
  }

  return leaves.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Get leaves by date range (Admin)
export const getLeavesByDateRange = async (startDate, endDate) => {
  const allLeaves = await getAllLeaves();
  return allLeaves.filter(l => l.date >= startDate && l.date <= endDate);
};

// Get specific leave application
export const getLeaveById = async (leaveId) => {
  const leave = leavesCollection.getById(leaveId);
  
  if (!leave) {
    throw new Error('Leave application not found');
  }
  
  const leaveCopy = { ...leave };
  
  // Populate applicant
  const applicant = await getCurrentUserProfile(leaveCopy.applicantId);
  leaveCopy.applicant = applicant;
  
  // Populate coveredBy for each lecture
  for (let i = 0; i < leaveCopy.lecturesOnLeave.length; i++) {
    if (leaveCopy.lecturesOnLeave[i].coveredById) {
      const coveredBy = await getCurrentUserProfile(leaveCopy.lecturesOnLeave[i].coveredById);
      leaveCopy.lecturesOnLeave[i].coveredBy = coveredBy;
    }
  }
  
  return leaveCopy;
};
// Cancel specific lecture from leave application
export const cancelLectureFromLeave = async (leaveId, slotNum, userId) => {
  const leave = await getLeaveById(leaveId);
  
  if (leave.applicantId !== userId) {
    throw new Error('Unauthorized');
  }

  // Session-Based Cancellation Deadlines Check
  const now = new Date();
  const leaveDateObj = new Date(leave.date + 'T00:00:00');
  
  // Clear time for comparison
  const today = new Date();
  today.setHours(0,0,0,0);
  
  // If today is leave date, check deadlines
  if (now.toDateString() === leaveDateObj.toDateString()) {
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const isMorning = slotNum <= 4;
    
    if (isMorning) {
      if (currentMins >= 8 * 60 + 50) { // 8:50 AM
        throw new Error('Morning session slots (1-4) cannot be cancelled after 8:50 AM');
      }
    } else {
      if (currentMins >= 12 * 60 + 10) { // 12:10 PM
        throw new Error('Afternoon session slots (5-8) cannot be cancelled after 12:10 PM');
      }
    }
  } else if (now > leaveDateObj) {
    throw new Error('Cannot cancel lectures for a past date');
  }

  const updatedLectures = leave.lecturesOnLeave.map(l => {
    if (l.slot === slotNum) return { ...l, cancelled: true };
    return l;
  });

  const activeLectures = updatedLectures.filter(l => !l.cancelled);
  const status = activeLectures.length === 0 ? 'cancelled' : leave.status;

  leavesCollection.update(leaveId, { 
    lecturesOnLeave: updatedLectures,
    status: status
  });

  // Automatically revoke substitution requests for this slot
  await cancelRequestsBySlot(leaveId, slotNum);

  return await getLeaveById(leaveId);

};

// Cancel leave application
export const cancelLeave = async (leaveId, userId) => {
  const leave = await getLeaveById(leaveId);
  
  if (leave.applicantId !== userId) {
    throw new Error('Unauthorized');
  }
  
  const updatedLeave = leavesCollection.update(leaveId, { status: 'cancelled' });
  return await getLeaveById(updatedLeave._id);
};
