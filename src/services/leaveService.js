import { apiCall } from '../utils/api';
import { getCurrentUserProfile } from './authService';
import { cancelRequestsBySlot } from './substitutionService';

const applyAcceptedCoverage = (leave, allRequests) => {
  const leaveCopy = { ...leave };
  const acceptedForLeave = allRequests.filter(
    r => r.leaveId === leaveCopy._id && r.status === 'accepted'
  );

  leaveCopy.lecturesOnLeave = (leaveCopy.lecturesOnLeave || []).map(lecture => {
    if (lecture.cancelled) return lecture;
    if (lecture.covered) return lecture;

    const acceptedReq = acceptedForLeave.find(
      r => Number(r.lectureSlot) === Number(lecture.slot)
    );

    if (acceptedReq) {
      return {
        ...lecture,
        covered: true,
        coveredById: acceptedReq.substituteTeacherId,
      };
    }

    return lecture;
  });

  const activeLectures = leaveCopy.lecturesOnLeave.filter(l => !l.cancelled);
  const coveredLectures = activeLectures.filter(l => l.covered).length;

  if (activeLectures.length === 0) {
    leaveCopy.status = 'cancelled';
  } else if (coveredLectures === activeLectures.length) {
    leaveCopy.status = 'fully_covered';
  } else if (coveredLectures > 0) {
    leaveCopy.status = 'partially_covered';
  } else if (leaveCopy.status !== 'cancelled') {
    leaveCopy.status = 'pending';
  }

  return leaveCopy;
};

// Create leave application
export const createLeave = async (applicantId, leaveData) => {
  const { date, reason, lecturesOnLeave, type, isSubstitutionOnly, documentProof } = leaveData;

  // Prevent duplicate leave applications for the same LECTURE SLOTS on the same date
  const allLeaves = await apiCall('/leaves');
  const activeLeavesToday = allLeaves.filter(l =>
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

    await apiCall(`/leaves/${existingActiveLeave._id}`, 'PUT', {
      lecturesOnLeave: updatedLectures,
      status: newStatus,
      reason: existingActiveLeave.reason + (reason ? ` | ${reason}` : ''),
      type: existingActiveLeave.type || type,
      documentProof: existingActiveLeave.documentProof || documentProof,
      isSubstitutionOnly: existingActiveLeave.isSubstitutionOnly || isSubstitutionOnly
    });

    return await getLeaveById(existingActiveLeave._id);
  }

  const savedLeave = await apiCall('/leaves', 'POST', {
    applicantId,
    date,
    type,
    isSubstitutionOnly,
    documentProof,
    reason,
    lecturesOnLeave: lecturesOnLeave.map(l => ({ ...l, covered: false, coveredById: null, cancelled: false })),
  });

  return await getLeaveById(savedLeave._id);
};

// Get current user's leave applications
export const getMyLeaves = async (userId) => {
  const allLeaves = await apiCall('/leaves');
  const allRequests = await apiCall('/substitutionRequests');
  const myLeaves = allLeaves.filter(l => l.applicantId === userId);

  const leaves = [];

  for (const leave of myLeaves) {
    const leaveCopy = applyAcceptedCoverage(leave, allRequests);
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
  const allLeaves = await apiCall('/leaves');
  const allRequests = await apiCall('/substitutionRequests');
  const leaves = [];

  for (const leave of allLeaves) {
    const leaveCopy = applyAcceptedCoverage(leave, allRequests);
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
  const leave = await apiCall(`/leaves/${leaveId}`);
  const allRequests = await apiCall('/substitutionRequests');

  if (!leave) {
    throw new Error('Leave application not found');
  }

  const leaveCopy = applyAcceptedCoverage(leave, allRequests);

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

  await apiCall(`/leaves/${leaveId}`, 'PUT', {
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

  await apiCall(`/leaves/${leaveId}`, 'PUT', { status: 'cancelled' });
  return await getLeaveById(leaveId);
};
