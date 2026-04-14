import { localCollection } from '../utils/localDb';
import { getCurrentUserProfile } from './authService';

const leavesCollection = localCollection('leaves');

// Create leave application
export const createLeave = async (applicantId, leaveData) => {
  const { date, reason, lecturesOnLeave } = leaveData;
  
  const savedLeave = leavesCollection.add({
    applicantId,
    date, // expects string 'YYYY-MM-DD'
    reason,
    lecturesOnLeave: lecturesOnLeave.map(l => ({ ...l, covered: false, coveredById: null })),
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

// Cancel leave application
export const cancelLeave = async (leaveId, userId) => {
  const leave = await getLeaveById(leaveId);
  
  if (leave.applicantId !== userId) {
    throw new Error('Unauthorized');
  }
  
  const updatedLeave = leavesCollection.update(leaveId, { status: 'cancelled' });
  return await getLeaveById(updatedLeave._id);
};
