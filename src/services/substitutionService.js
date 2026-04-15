import { localCollection } from '../utils/localDb';
import { getCurrentUserProfile, getAllTeachersInfo } from './authService';
import { getLeaveById } from './leaveService';

const substitutionsCollection = localCollection('substitutionRequests');
const leavesCollection = localCollection('leaves');

// Send substitution request
export const sendSubstitutionRequest = async (requestData) => {
  const { leaveApplicationId, fromTeacherId, toTeacherId, lectureSlot, subject, date } = requestData;

  const allRequests = substitutionsCollection.getAll();

  // Check if a request already exists
  const existingReqs = allRequests.filter(req => 
    req.leaveApplicationId === leaveApplicationId &&
    req.toTeacherId === toTeacherId &&
    req.lectureSlot === lectureSlot &&
    (req.status === 'pending' || req.status === 'accepted')
  );
  
  if (existingReqs.length > 0) {
    throw new Error('A request already exists for this teacher and slot');
  }

  // Check if slot is already covered
  const acceptedReqs = allRequests.filter(req => 
    req.leaveApplicationId === leaveApplicationId &&
    req.lectureSlot === lectureSlot &&
    req.status === 'accepted'
  );
  
  if (acceptedReqs.length > 0) {
    throw new Error('This lecture slot is already covered');
  }

  const savedReq = substitutionsCollection.add({
    leaveApplicationId,
    fromTeacherId,
    toTeacherId,
    lectureSlot,
    subject,
    date, // 'YYYY-MM-DD'
    status: 'pending',
    rejectionReason: '',
    createdAt: new Date().toISOString()
  });

  return await getRequestById(savedReq._id);
};

// Get request by ID (helper)
export const getRequestById = async (requestId) => {
  const req = substitutionsCollection.getById(requestId);
  if (!req) return null;
  
  const reqCopy = { ...req };
  reqCopy.fromTeacher = await getCurrentUserProfile(req.fromTeacherId);
  reqCopy.toTeacher = await getCurrentUserProfile(req.toTeacherId);
  return reqCopy;
};

// Get incoming requests
export const getIncomingRequests = async (userId) => {
  const allRequests = substitutionsCollection.getAll();
  const myRequests = allRequests.filter(req => req.toTeacherId === userId);
  
  const requests = [];
  
  for (const req of myRequests) {
    const reqCopy = { ...req };
    reqCopy.fromTeacher = await getCurrentUserProfile(req.fromTeacherId);
    reqCopy.toTeacher = await getCurrentUserProfile(req.toTeacherId);
    requests.push(reqCopy);
  }
  
  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Get outgoing requests for a specific leave
export const getOutgoingRequests = async (leaveId, userId) => {
  const allRequests = substitutionsCollection.getAll();
  const myRequests = allRequests.filter(req => 
    req.leaveApplicationId === leaveId && 
    req.fromTeacherId === userId
  );
  
  const requests = [];
  
  for (const req of myRequests) {
    const reqCopy = { ...req };
    reqCopy.fromTeacher = await getCurrentUserProfile(req.fromTeacherId);
    reqCopy.toTeacher = await getCurrentUserProfile(req.toTeacherId);
    requests.push(reqCopy);
  }
  
  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Accept substitution request
export const acceptRequest = async (requestId, userId) => {
  const request = substitutionsCollection.getById(requestId);
  
  if (!request || request.toTeacherId !== userId || request.status !== 'pending') {
    throw new Error('Request not found or already processed');
  }

  // Check if slot already covered
  const allRequests = substitutionsCollection.getAll();
  const alreadyCovered = allRequests.filter(req => 
    req.leaveApplicationId === request.leaveApplicationId &&
    req.lectureSlot === request.lectureSlot &&
    req.status === 'accepted'
  );
  
  if (alreadyCovered.length > 0) {
    // Reject this one automatically
    substitutionsCollection.update(requestId, { 
      status: 'cancelled',
      rejectionReason: 'Slot already covered by another teacher'
    });
    throw new Error('This slot has already been covered by another teacher');
  }

  // Update request status
  substitutionsCollection.update(requestId, { status: 'accepted' });

  // Update Leave Application
  const leave = leavesCollection.getById(request.leaveApplicationId);
  
  if (leave) {
    const lectures = leave.lecturesOnLeave;
    
    // Update the specific lecture
    const updatedLectures = lectures.map(l => {
      if (l.slot === request.lectureSlot) {
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
    
    leavesCollection.update(leave._id, {
      lecturesOnLeave: updatedLectures,
      status: newStatus
    });
  }

  // Reject other pending requests for the same slot
  const freshRequests = substitutionsCollection.getAll();
  const pendingRequests = freshRequests.filter(req => 
    req.leaveApplicationId === request.leaveApplicationId &&
    req.lectureSlot === request.lectureSlot &&
    req.status === 'pending' &&
    req._id !== requestId
  );
  
  for (const pending of pendingRequests) {
    substitutionsCollection.update(pending._id, {
      status: 'cancelled',
      rejectionReason: 'Slot covered by another teacher'
    });
  }

  return await getRequestById(requestId);
};

// Reject substitution request
export const rejectRequest = async (requestId, userId, reason) => {
  const request = substitutionsCollection.getById(requestId);
  
  if (!request || request.toTeacherId !== userId || request.status !== 'pending') {
    throw new Error('Request not found or already processed');
  }

  substitutionsCollection.update(requestId, { 
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
  const allRequests = substitutionsCollection.getAll();
  const busySubs = allRequests.filter(req => 
    req.date === dateStr &&
    req.lectureSlot === slotNum &&
    req.status === 'accepted'
  );
  
  const busyTeacherIds = busySubs.map(req => req.toTeacherId);

  return availableTeachers.filter(t => !busyTeacherIds.includes(t._id)).map(t => {
    const daySchedule = t.timetable?.[dayName] || [];
    const totalLecturesDay = daySchedule.length;
    
    // check if they have accepted substitution requests for other slots on this day
    const acceptedSubsToday = allRequests.filter(req => 
      req.date === dateStr && 
      req.toTeacherId === t._id && 
      req.status === 'accepted'
    );
    
    const effectiveTotalLectures = totalLecturesDay + acceptedSubsToday.length;

    // Check continuous from original timetable AND substitutions
    const hasTimetableContinuous = daySchedule.some(l => l.slot === slotNum - 1 || l.slot === slotNum + 1);
    const hasSubContinuous = acceptedSubsToday.some(req => req.lectureSlot === slotNum - 1 || req.lectureSlot === slotNum + 1);
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
  const allRequests = substitutionsCollection.getAll();
  const affectedRequests = allRequests.filter(req => 
    req.leaveApplicationId === leaveId && 
    req.lectureSlot === parseInt(slotNum) &&
    (req.status === 'pending' || req.status === 'accepted')
  );

  for (const req of affectedRequests) {
    substitutionsCollection.update(req._id, { 
      status: 'cancelled',
      rejectionReason: 'The teacher has cancelled this specific lecture leave'
    });
  }
};
