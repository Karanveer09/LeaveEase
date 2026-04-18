import { localCollection } from '../utils/localDb';

const holidaysCollection = localCollection('holidays');
const overridesCollection = localCollection('timetableOverrides');
const usersCollection = localCollection('users');

const checkAdmin = (adminId) => {
  const admin = usersCollection.getById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required.');
  }
};

// ====== Holidays ======
export const addHoliday = async (adminId, holidayData) => {
  checkAdmin(adminId);
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
