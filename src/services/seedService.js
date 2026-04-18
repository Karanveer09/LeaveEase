import { localCollection } from '../utils/localDb';

const usersCollection = localCollection('users');

const rawFaculty = [
  { id: 'T01', name: 'Er. Bhavneet Singh', initials: 'BS' },
  { id: 'T02', name: 'Er. Bikramjit Singh', initials: 'BJS' },
  { id: 'T03', name: 'Er. Navjot Kaur', initials: 'NK' },
  { id: 'T04', name: 'Er. Gurjinderpal Singh', initials: 'GPS' },
  { id: 'T05', name: 'Er. Gurleen Kaur', initials: 'GK' },
  { id: 'T06', name: 'Er. Shivani', initials: 'SH' },
  { id: 'T07', name: 'Er. Kanwaldeep', initials: 'KK' },
  { id: 'T08', name: 'Er. Sandeep Kaur', initials: 'SK' },
  { id: 'T09', name: 'Er. Gurwinder Singh', initials: 'GWS' },
  { id: 'T10', name: 'Er. Gurmeet Singh', initials: 'GMS' },
  { id: 'T11', name: 'Er. Satinderbir Kaur', initials: 'SBK' },
  { id: 'T12', name: 'Er. Nisha', initials: 'NS' },
  { id: 'T13', name: 'Er. Akash Gill', initials: 'AG' },
  { id: 'T14', name: 'Er. Nikhil', initials: 'NKH' },
  { id: 'T15', name: 'Er. Sanjogdeep Singh', initials: 'SS' },
  { id: 'T16', name: 'Er. Manpreet Kaur', initials: 'MK' }
];

const freeSlotsData = {
  monday: {
    1: ["T01", "T04", "T07", "T08", "T11", "T14", "T15"],
    2: ["T01", "T02", "T03", "T04", "T05", "T08", "T09", "T10", "T12", "T13", "T15"],
    3: ["T06", "T07", "T11", "T14", "T16", "T08"],
    4: ["T01", "T02", "T03", "T04", "T06", "T09", "T12", "T13", "T16"],
    5: ["T01", "T02", "T03", "T04", "T06", "T11", "T12", "T13", "T14", "T15", "T16"],
    6: ["T01", "T02", "T03", "T04", "T05", "T08", "T09", "T10", "T11", "T12", "T13", "T14"],
    7: ["T04", "T05", "T06", "T07", "T09", "T10", "T12", "T15"],
    8: ["T01", "T05", "T07", "T08", "T09", "T10", "T15"]
  },
  tuesday: {
    1: ["T03", "T04", "T05", "T07", "T08", "T09", "T10", "T12", "T13"],
    2: ["T02", "T06", "T07", "T11", "T14", "T16", "T13", "T15"],
    3: ["T01", "T04", "T05", "T08", "T09", "T10", "T12", "T14", "T15"],
    4: ["T01", "T02", "T05", "T06", "T07", "T08", "T09", "T10", "T11", "T12", "T15", "T16"],
    5: ["T01", "T02", "T04", "T06", "T10", "T11"],
    6: ["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T09", "T12", "T13", "T14", "T15"],
    7: ["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T08", "T09", "T10", "T11", "T12", "T13", "T14", "T15", "T16"],
    8: ["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T08", "T09", "T10", "T11", "T12", "T13", "T14", "T15", "T16"]
  },
  wednesday: {
    1: ["T01", "T02", "T03", "T06", "T09", "T10", "T16"],
    2: ["T02", "T04", "T05", "T06", "T07", "T08", "T11", "T13", "T15", "T14", "T16"],
    3: ["T01", "T03", "T05", "T08", "T10", "T12"],
    4: ["T01", "T03", "T05", "T08", "T10", "T12", "T13", "T14"],
    5: ["T04", "T05", "T06", "T07", "T09", "T13", "T11", "T16"],
    6: ["T01", "T02", "T04", "T05", "T08", "T09", "T12"],
    7: ["T01", "T03", "T10", "T13", "T08", "T14", "T15", "T16"],
    8: ["T01", "T03", "T05", "T08", "T11", "T12", "T14", "T16"]
  },
  thursday: {
    1: ["T01", "T02", "T06", "T11", "T12", "T13", "T15"],
    2: ["T03", "T04", "T07", "T09", "T10", "T11", "T15", "T16"],
    3: ["T01", "T02", "T03", "T06", "T08", "T10"],
    4: ["T01", "T06", "T08", "T09", "T10", "T11", "T14", "T15"],
    5: ["T01", "T02", "T04", "T06", "T09", "T11", "T14", "T15"],
    6: ["T01", "T02", "T03", "T07", "T08", "T09", "T12", "T13", "T15", "T16"],
    7: ["T02", "T03", "T05", "T06", "T07", "T10", "T11", "T12", "T14"],
    8: ["T01", "T02", "T03", "T04", "T05", "T06", "T07", "T09", "T10", "T12"]
  },
  friday: {
    1: ["T01", "T03", "T04", "T06", "T07", "T11", "T13", "T14", "T16"],
    2: ["T03", "T05", "T08", "T09", "T10", "T12"],
    3: ["T01", "T04", "T06", "T07", "T08", "T11", "T13", "T14", "T16"],
    4: ["T01", "T02", "T04", "T05", "T07", "T08", "T13", "T15", "T16"],
    5: ["T01", "T04", "T05", "T06", "T07", "T08", "T11", "T16"],
    6: ["T01", "T02", "T03", "T04", "T06", "T08", "T11", "T15", "T16"],
    7: ["T01", "T07", "T09", "T11", "T12", "T13", "T14", "T15", "T16"],
    8: ["T02", "T03", "T04", "T07", "T10", "T12", "T14"]
  }
};

const sampleTeachers = rawFaculty.map(f => {
  const timetable = {
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: []
  };

  ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(day => {
    [1, 2, 3, 4, 5, 6, 7, 8].forEach(slot => {
      const isFree = freeSlotsData[day][slot].includes(f.id);
      if (!isFree) {
        timetable[day].push({ slot, subject: 'Class' });
      }
    });
  });

  return {
    name: `${f.initials} (${f.id})`,
    email: `${f.id.toLowerCase()}@college.edu`,
    password: 'password123',
    department: 'Computer Science',
    role: 'teacher',
    profileSetup: true,
    timetable
  };
});

const adminUser = {
  name: 'Dr. Admin',
  email: 'admin@college.edu',
  password: 'admin123',
  department: 'Computer Science',
  role: 'admin',
  profileSetup: true,
  timetable: {
    monday: [], tuesday: [], wednesday: [],
    thursday: [], friday: []
  }
};

export const seedDatabase = async () => {
  console.log('Checking database and seeding real-world data...');
  // Session persistence restored - current user is no longer removed on refresh
  // localStorage.removeItem('currentUser');

  
  try {
    const existingUsers = usersCollection.getAll();

    // Check if Tuesday 7 or 8 is incorrectly assigned to ANY teacher
    let needsTuesdayFix = false;
    for (const u of existingUsers) {
      if (u.timetable?.tuesday?.some(s => s.slot === 7 || s.slot === 8)) {
        needsTuesdayFix = true;
        break;
      }
    }

    if (needsTuesdayFix || existingUsers.length === 0) {
      console.log('Migrating: clearing old data to ensure Tuesday 7 & 8 are entirely free...');
      usersCollection.setAll([]);
      const leavesCollection = localCollection('leaves');
      const subsCollection = localCollection('substitutionRequests');
      leavesCollection.setAll([]);
      subsCollection.setAll([]);

      // Seed 3 admins
      const admins = [
        { name: 'Admin 1', email: 'admin1@college.edu', password: 'admin123' },
        { name: 'Admin 2', email: 'admin2@college.edu', password: 'admin123' },
        { name: 'Admin 3', email: 'admin3@college.edu', password: 'admin123' },
      ];

      for (const a of admins) {
        usersCollection.add({
          name: a.name,
          email: a.email,
          password: a.password,
          department: 'Administration',
          role: 'admin',
          profileSetup: true,
          timetable: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] },
          createdAt: new Date().toISOString()
        });
        console.log(`Created admin: ${a.name}`);
      }

      // Seed teachers
      for (const teacher of sampleTeachers) {
        usersCollection.add({
          name: teacher.name,
          email: teacher.email,
          password: teacher.password,
          department: teacher.department,
          role: teacher.role,
          profileSetup: teacher.profileSetup,
          timetable: teacher.timetable,
          createdAt: new Date().toISOString()
        });
        console.log(`Created teacher: ${teacher.name}`);
      }

      // We explicitly NO LONGER seed dummy leaves. 
      // The old fake leaves caused contradictions with the actual free slots.

      console.log('Database seeded with clean data. No auto-login.');


      // Force reload to reflect new clean data
      window.location.reload();

    } else {
      console.log('Database already seeded with real-world T-ID data.');

      // Migration: Ensure initials are updated to NS, SH, KK
      const allUsers = usersCollection.getAll();
      
      // FRESH START: Clear out previous leave and substitution data
      localCollection('leaves').setAll([]);
      localCollection('substitutionRequests').setAll([]);
      console.log('Database cleared: Leaves and Substitution Requests removed for a fresh start.');

      let updatedCount = 0;

      const updatedUsers = allUsers.map(u => {
        let changed = false;
        let newName = u.name;
        
        // Exact match or cleanup for T06, T07, T12
        if (u.email === 't06@college.edu' && !newName.includes('SH (T06)')) { newName = 'SH (T06)'; changed = true; }
        if (u.email === 't07@college.edu' && !newName.includes('KK (T07)')) { newName = 'KK (T07)'; changed = true; }
        if (u.email === 't12@college.edu' && !newName.includes('NS (T12)')) { newName = 'NS (T12)'; changed = true; }
        
        // Final cleanup for any KKK/KKKK accidentally created
        if (newName.includes('KKK')) { 
          if (u.email === 't07@college.edu') newName = 'KK (T07)';
          changed = true; 
        }

        if (changed) {
          updatedCount++;
          return { ...u, name: newName };
        }
        return u;
      });


      if (updatedCount > 0) {
        console.log(`Migrated initials for ${updatedCount} users.`);
        usersCollection.setAll(updatedUsers);
      }

      // Auto-login logic removed to ensure security
    }

    return true;
  } catch (error) {
    console.error("Seeding Error:", error);
    return false;
  }
};

