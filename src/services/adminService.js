import { apiCall } from '../utils/api';

const checkAdmin = async (adminId) => {
  const admin = await apiCall(`/users/${adminId}`);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required.');
  }
};

// ====== Holidays ======
export const addHoliday = async (adminId, holidayData) => {
  await checkAdmin(adminId);

  const date = holidayData.date;

  // 1. Cancel all active leaves on this date
  const allLeaves = await apiCall('/leaves');
  const leavesOnDate = allLeaves.filter(l => l.date === date && l.status !== 'cancelled');
  for (const leave of leavesOnDate) {
    await apiCall(`/leaves/${leave._id}`, 'PUT', {
      status: 'cancelled',
      reason: (leave.reason ? leave.reason + " | " : "") + `Cancelled: Date declared as holiday (${holidayData.name})`
    });
  }

  // 2. Cancel all substitution requests on this date
  const allSubs = await apiCall('/substitutionRequests');
  const subsOnDate = allSubs.filter(s => s.date === date && s.status !== 'cancelled' && s.status !== 'rejected');
  for (const sub of subsOnDate) {
    await apiCall(`/substitutionRequests/${sub._id}`, 'PUT', {
      status: 'cancelled',
      rejectionReason: `Cancelled: Date declared as holiday (${holidayData.name})`
    });
  }

  return await apiCall('/holidays', 'POST', holidayData);
};

export const getHolidays = async () => {
  const holidays = await apiCall('/holidays');
  return holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const deleteHoliday = async (adminId, holidayId) => {
  await checkAdmin(adminId);
  await apiCall(`/holidays/${holidayId}`, 'DELETE');
};

// ====== Timetable Overrides (Saturdays) ======
export const setSaturdayOverride = async (adminId, overrideData) => {
  await checkAdmin(adminId);

  // Clean up existing override for same date
  const allOverrides = await apiCall('/timetableOverrides');
  const existing = allOverrides.find(o => o.date === overrideData.date);
  if (existing) {
    await apiCall(`/timetableOverrides/${existing._id}`, 'DELETE');
  }

  return await apiCall('/timetableOverrides', 'POST', overrideData);
};

export const getSaturdayOverrides = async () => {
  const overrides = await apiCall('/timetableOverrides');
  return overrides.sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const deleteSaturdayOverride = async (adminId, overrideId) => {
  await checkAdmin(adminId);
  await apiCall(`/timetableOverrides/${overrideId}`, 'DELETE');
};
