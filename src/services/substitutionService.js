import { apiCall } from '../utils/api';
import { getCurrentUserProfile, getAllTeachersInfo } from './authService';
import { getLeaveById } from './leaveService';

// Send substitution request
export const sendSubstitutionRequest = async (requestData) => {
  const { leaveApplicationId, fromTeacherId, toTeacherId, lectureSlot, subject, className, date } = requestData;

  const allRequests = await apiCall('/substitutionRequests');

  // Check if a request already exists
  const existingReqs = allRequests.filter(req =>
    req.leaveId === leaveApplicationId &&
    req.substituteTeacherId === toTeacherId &&
    req.lectureSlot === lectureSlot &&
    (req.status === 'pending' || req.status === 'accepted')
  );

  if (existingReqs.length > 0) {
    throw new Error('A request already exists for this teacher and slot');
  }

  // Check if slot is already covered
  const acceptedReqs = allRequests.filter(req =>
    req.leaveId === leaveApplicationId &&
    req.lectureSlot === lectureSlot &&
    req.status === 'accepted'
  );

  if (acceptedReqs.length > 0) {
    throw new Error('This lecture slot is already covered');
  }

  const savedReq = await apiCall('/substitutionRequests', 'POST', {
    leaveId: leaveApplicationId,
    fromTeacherId,
    substituteTeacherId: toTeacherId,
    lectureSlot,
    subject,
    class: className,
    date,
  });

  return await getRequestById(savedReq._id);
};

// Get request by ID (helper)
export const getRequestById = async (requestId) => {
  const req = await apiCall(`/substitutionRequests/${requestId}`);
  if (!req) return null;

  const reqCopy = { ...req };
  reqCopy.fromTeacher = await getCurrentUserProfile(req.fromTeacherId);
  reqCopy.toTeacher = await getCurrentUserProfile(req.substituteTeacherId);
  return reqCopy;
};

// Get incoming requests
export const getIncomingRequests = async (userId) => {
  const allRequests = await apiCall('/substitutionRequests');
  const myRequests = allRequests.filter(req => req.substituteTeacherId === userId);

  const requests = [];

  for (const req of myRequests) {
    const reqCopy = { ...req };
    reqCopy.fromTeacher = await getCurrentUserProfile(req.fromTeacherId);
    reqCopy.toTeacher = await getCurrentUserProfile(req.substituteTeacherId);
    requests.push(reqCopy);
  }

  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Get outgoing requests for a specific leave
export const getOutgoingRequests = async (leaveId, userId) => {
  const allRequests = await apiCall('/substitutionRequests');
  const myRequests = allRequests.filter(req =>
    req.leaveId === leaveId &&
    req.fromTeacherId === userId
  );

  const requests = [];

  for (const req of myRequests) {
    const reqCopy = { ...req };
    reqCopy.fromTeacher = await getCurrentUserProfile(req.fromTeacherId);
    reqCopy.toTeacher = await getCurrentUserProfile(req.substituteTeacherId);
    requests.push(reqCopy);
  }

  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Accept substitution request
export const acceptRequest = async (requestId, userId) => {
  const request = await apiCall(`/substitutionRequests/${requestId}`);
  const requestSlot = Number(request?.lectureSlot);

  if (!request || request.substituteTeacherId !== userId || request.status !== 'pending') {
    throw new Error('Request not found or already processed');
  }

  // Check if slot already covered
  const allRequests = await apiCall('/substitutionRequests');
  const alreadyCovered = allRequests.filter(req =>
    req.leaveId === request.leaveId &&
    Number(req.lectureSlot) === requestSlot &&
    req.status === 'accepted'
  );

  if (alreadyCovered.length > 0) {
    // Reject this one automatically
    await apiCall(`/substitutionRequests/${requestId}`, 'PUT', {
      status: 'cancelled',
      rejectionReason: 'Slot already covered by another teacher'
    });
    throw new Error('This slot has already been covered by another teacher');
  }

  // Update request status
  await apiCall(`/substitutionRequests/${requestId}`, 'PUT', { status: 'accepted' });

  // Update Leave Application
  const leave = await apiCall(`/leaves/${request.leaveId}`);

  if (leave) {
    const lectures = leave.lecturesOnLeave;

    // Update the specific lecture
    const updatedLectures = lectures.map(l => {
      if (Number(l.slot) === requestSlot) {
        return { ...l, covered: true, coveredById: userId };
      }
      return l;
    });

    // Calc new status
    const totalLectures = updatedLectures.length;
    const coveredLectures = updatedLectures.filter(l => l.covered).length;

    let newStatus = 'pending';
    if (coveredLectures === totalLectures) newStatus = 'fully_covered';
    else if (coveredLectures > 0) newStatus = 'partially_covered';

    await apiCall(`/leaves/${leave._id}`, 'PUT', {
      lecturesOnLeave: updatedLectures,
      status: newStatus
    });
  }

  // Reject other pending requests for the same slot
  const freshRequests = await apiCall('/substitutionRequests');
  const pendingRequests = freshRequests.filter(req =>
    req.leaveId === request.leaveId &&
    Number(req.lectureSlot) === requestSlot &&
    req.status === 'pending' &&
    req._id !== requestId
  );

  for (const pending of pendingRequests) {
    await apiCall(`/substitutionRequests/${pending._id}`, 'PUT', {
      status: 'cancelled',
      rejectionReason: 'Slot covered by another teacher'
    });
  }

  return await getRequestById(requestId);
};

// Reject substitution request
export const rejectRequest = async (requestId, userId, reason) => {
  const request = await apiCall(`/substitutionRequests/${requestId}`);

  if (!request || request.substituteTeacherId !== userId || request.status !== 'pending') {
    throw new Error('Request not found or already processed');
  }

  await apiCall(`/substitutionRequests/${requestId}`, 'PUT', {
    status: 'rejected',
    rejectionReason: reason || 'No reason provided'
  });

  return await getRequestById(requestId);
};

// Get Available Teachers
export const getAvailableTeachers = async (dateStr, slot, currentUserId) => {
  if (!dateStr || !slot) {
    throw new Error('Date and slot are required');
  }

  const leaveDate = new Date(dateStr + 'T00:00:00');
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayName = days[leaveDate.getDay()];
  const slotNum = parseInt(slot);

  // Get all teachers except current
  const allTeachers = await getAllTeachersInfo(currentUserId);

  // Filter those who don't have a lecture at this time
  const availableTeachers = allTeachers.filter(teacher => {
    const daySchedule = teacher.timetable?.[dayName] || [];
    const hasLecture = daySchedule.some(l => l.slot === slotNum);
    return !hasLecture;
  });

  // Filter out those who have already accepted a substitution
  const allRequests = await apiCall('/substitutionRequests');
  const busySubs = allRequests.filter(req =>
    req.date === dateStr &&
    Number(req.lectureSlot) === slotNum &&
    req.status === 'accepted'
  );

  const busyTeacherIds = busySubs.map(req => req.substituteTeacherId);

  return availableTeachers.filter(t => !busyTeacherIds.includes(t._id)).map(t => {
    const daySchedule = t.timetable?.[dayName] || [];
    const totalLecturesDay = daySchedule.length;
    
    // check if they have accepted substitution requests for other slots on this day
    const acceptedSubsToday = allRequests.filter(req => 
      req.date === dateStr && 
      req.substituteTeacherId === t._id && 
      req.status === 'accepted'
    );
    
    const effectiveTotalLectures = totalLecturesDay + acceptedSubsToday.length;

    // Check continuous from original timetable AND substitutions
    const hasTimetableContinuous = daySchedule.some(l => l.slot === slotNum - 1 || l.slot === slotNum + 1);
    const hasSubContinuous = acceptedSubsToday.some(req => Number(req.lectureSlot) === slotNum - 1 || Number(req.lectureSlot) === slotNum + 1);
    const hasContinuous = hasTimetableContinuous || hasSubContinuous;

    return {
      ...t,
      effectiveTotalLectures,
      hasContinuous
    };
  });
};
// Cancel requests for a specific slot (used when slot is cancelled from leave)
export const cancelRequestsBySlot = async (leaveId, slotNum) => {
  const allRequests = await apiCall('/substitutionRequests');
  const affectedRequests = allRequests.filter(req =>
    req.leaveId === leaveId &&
    Number(req.lectureSlot) === Number(slotNum) &&
    (req.status === 'pending' || req.status === 'accepted')
  );

  for (const req of affectedRequests) {
    await apiCall(`/substitutionRequests/${req._id}`, 'PUT', {
      status: 'cancelled',
      rejectionReason: 'The teacher has cancelled this specific lecture leave'
    });
  }
};
