import { localCollection } from '../utils/localDb';

const holidaysCollection = localCollection('holidays');
const overridesCollection = localCollection('timetableOverrides');
const usersCollection = localCollection('users');
const leavesCollection = localCollection('leaves');
const substitutionsCollection = localCollection('substitutionRequests');

const checkAdmin = (adminId) => {
  const admin = usersCollection.getById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required.');
  }
};

// ====== Holidays ======
export const addHoliday = async (adminId, holidayData) => {
  checkAdmin(adminId);
  
  const date = holidayData.date;
  
  // 1. Cancel all active leaves on this date
  const leavesOnDate = leavesCollection.getAll().filter(l => l.date === date && l.status !== 'cancelled');
  for (const leave of leavesOnDate) {
    leavesCollection.update(leave._id, {
      status: 'cancelled',
      reason: (leave.reason ? leave.reason + " | " : "") + `Cancelled: Date declared as holiday (${holidayData.name})`
    });
  }

  // 2. Cancel all substitution requests on this date
  const subsOnDate = substitutionsCollection.getAll().filter(s => s.date === date && s.status !== 'cancelled' && s.status !== 'rejected');
  for (const sub of subsOnDate) {
    substitutionsCollection.update(sub._id, {
      status: 'cancelled',
      rejectionReason: `Cancelled: Date declared as holiday (${holidayData.name})`
    });
  }

  return holidaysCollection.add({
    ...holidayData,
    createdAt: new Date().toISOString()
  });
};

export const getHolidays = async () => {
  return holidaysCollection.getAll().sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const deleteHoliday = async (adminId, holidayId) => {
  checkAdmin(adminId);
  return holidaysCollection.delete(holidayId);
};

// ====== Timetable Overrides (Saturdays) ======
export const setSaturdayOverride = async (adminId, overrideData) => {
  checkAdmin(adminId);
  
  // Clean up existing override for same date
  const existing = overridesCollection.getAll().find(o => o.date === overrideData.date);
  if (existing) {
    overridesCollection.delete(existing._id);
  }

  return overridesCollection.add({
    ...overrideData,
    createdAt: new Date().toISOString()
  });
};

export const getSaturdayOverrides = async () => {
  return overridesCollection.getAll().sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const deleteSaturdayOverride = async (adminId, overrideId) => {
  checkAdmin(adminId);
  return overridesCollection.delete(overrideId);
};
