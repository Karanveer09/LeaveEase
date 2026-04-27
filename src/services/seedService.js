import { apiCall } from '../utils/api.js';

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
    5: ["T04", "T05", "T06", "T07", "T08", "T11", "T16"],
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
        let subject = 'Class';
        let className = 'N/A';
        
        // Use real data if available

        // REAL DATA FOR T01
        if (f.id === 'T01') {
          const schedule = [
            {"day":"Monday","lecture":3,"class":"C8","subject":"NSC"},
            {"day":"Monday","lecture":7,"class":"C4-2","subject":"OS"},
            {"day":"Tuesday","lecture":2,"class":"C8","subject":"NSC"},
            {"day":"Tuesday","lecture":1,"class":"C4-2","subject":"OS"},
            {"day":"Wednesday","lecture":5,"class":"C8","subject":"NSC"},
            {"day":"Wednesday","lecture":2,"class":"C4-2","subject":"OS"},
            {"day":"Thursday","lecture":7,"class":"C4-2","subject":"OS"},
            {"day":"Thursday","lecture":2,"class":"C8","subject":"NSC"},
            {"day":"Friday","lecture":2,"class":"C4-2","subject":"OS"},
            {"day":"Friday","lecture":5,"class":"C8","subject":"NSC"},
          ];
          
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T02 (BJS)
        if (f.id === 'T02') {
          const schedule = [
            {"day":"Monday","lecture":1,"class":"C7","subject":"DMW"},
            {"day":"Monday","lecture":3,"class":"C5","subject":"CD"},
            {"day":"Monday","lecture":7,"class":"C6 (G1)","subject":"CD Lab"},
            {"day":"Monday","lecture":8,"class":"C6 (G1)","subject":"CD Lab"},
            {"day":"Tuesday","lecture":1,"class":"C5","subject":"CD"},
            {"day":"Tuesday","lecture":3,"class":"C7","subject":"DMW"},
            {"day":"Wednesday","lecture":3,"class":"C6 (G2)","subject":"CD Lab"},
            {"day":"Wednesday","lecture":4,"class":"C6 (G2)","subject":"CD Lab"},
            {"day":"Wednesday","lecture":5,"class":"C5","subject":"CD"},
            {"day":"Thursday","lecture":2,"class":"C5","subject":"CD"},
            {"day":"Thursday","lecture":4,"class":"C7","subject":"DMW"},
            {"day":"Thursday","lecture":7,"class":"C5 (G1)","subject":"CD Lab"},
            {"day":"Thursday","lecture":8,"class":"C5 (G1)","subject":"CD Lab"},
            {"day":"Friday","lecture":1,"class":"C5 (G2)","subject":"CD Lab"},
            {"day":"Friday","lecture":2,"class":"C5 (G2)","subject":"CD Lab"},
            {"day":"Friday","lecture":3,"class":"C7","subject":"DMW"},
            {"day":"Friday","lecture":5,"class":"C5","subject":"CD"}
          ];
          
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T11 (Satinderbir)
        if (f.id === 'T11') {
          const schedule = [
            {"day":"Monday","lecture":2,"class":"C6","subject":"MPMC"},
            {"day":"Monday","lecture":4,"class":"IT8","subject":"STQA"},
            {"day":"Monday","lecture":7,"class":"C4-2 (G1)","subject":"DAA Lab"},
            {"day":"Monday","lecture":8,"class":"C4-2 (G1)","subject":"DAA Lab"},
            {"day":"Tuesday","lecture":1,"class":"C6","subject":"MPMC"},
            {"day":"Tuesday","lecture":3,"class":"IT8","subject":"STQA"},
            {"day":"Tuesday","lecture":6,"class":"IT-6","subject":"WT"},
            {"day":"Wednesday","lecture":1,"class":"IT-6","subject":"WT"},
            {"day":"Wednesday","lecture":3,"class":"C4-2 (G1)","subject":"DAA Lab"},
            {"day":"Wednesday","lecture":4,"class":"C4-2 (G1)","subject":"DAA Lab"},
            {"day":"Wednesday","lecture":5,"class":"C6","subject":"MPMC"},
            {"day":"Wednesday","lecture":6,"class":"IT8","subject":"STQA"},
            {"day":"Thursday","lecture":3,"class":"IT-6","subject":"WT"},
            {"day":"Thursday","lecture":6,"class":"C6","subject":"MPMC"},
            {"day":"Thursday","lecture":8,"class":"IT8","subject":"STQA"},
            {"day":"Friday","lecture":2,"class":"IT-6","subject":"WT"},
            {"day":"Friday","lecture":4,"class":"C6","subject":"MPMC"},
            {"day":"Friday","lecture":8,"class":"IT8","subject":"STQA"}
          ];
          
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T12 (NS)
        if (f.id === 'T12') {
          const schedule = [
            {"day":"Monday","lecture":3,"class":"IT-6","subject":"DS"},
            {"day":"Monday","lecture":7,"class":"C5","subject":"AI"},
            {"day":"Tuesday","lecture":2,"class":"IT-8","subject":"SPM"},
            {"day":"Tuesday","lecture":6,"class":"IT-6","subject":"DS"},
            {"day":"Tuesday","lecture":7,"class":"C5","subject":"AI"},
            {"day":"Wednesday","lecture":1,"class":"C5","subject":"AI"},
            {"day":"Wednesday","lecture":2,"class":"IT-6","subject":"OS"},
            {"day":"Wednesday","lecture":6,"class":"IT-8","subject":"SPM"},
            {"day":"Wednesday","lecture":7,"class":"C5","subject":"AI"},
            {"day":"Thursday","lecture":3,"class":"IT-8","subject":"SPM Lab"},
            {"day":"Thursday","lecture":4,"class":"IT-8","subject":"SPM Lab"},
            {"day":"Thursday","lecture":6,"class":"IT-6","subject":"DS"},
            {"day":"Friday","lecture":1,"class":"IT-6","subject":"OS"},
            {"day":"Friday","lecture":3,"class":"C5","subject":"AI"},
            {"day":"Friday","lecture":4,"class":"IT-8","subject":"SPM"},
            {"day":"Friday","lecture":6,"class":"IT-6","subject":"DS Lab"},
            {"day":"Friday","lecture":7,"class":"IT-6","subject":"DS Lab"}
          ];
          
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T03 (NK)
        if (f.id === 'T03') {
          const schedule = [
            {"day":"Monday","lecture":1,"class":"C6","subject":"MPMC"},
            {"day":"Monday","lecture":5,"class":"C5","subject":"CD"},
            {"day":"Tuesday","lecture":2,"class":"C6","subject":"MPMC"},
            {"day":"Tuesday","lecture":4,"class":"IT-8","subject":"SPM"},
            {"day":"Wednesday","lecture":2,"class":"IT-8","subject":"SPM Lab"},
            {"day":"Wednesday","lecture":3,"class":"IT-8","subject":"SPM Lab"},
            {"day":"Thursday","lecture":1,"class":"C5","subject":"CD"},
            {"day":"Thursday","lecture":5,"class":"C6","subject":"MPMC"},
            {"day":"Friday","lecture":2,"class":"C5","subject":"CD"},
            {"day":"Friday","lecture":6,"class":"IT-8","subject":"SPM"}
          ];
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T04 (GPS)
        if (f.id === 'T04') {
          const schedule = [
            {"day":"Monday","lecture":2,"class":"IT-6","subject":"DS"},
            {"day":"Monday","lecture":6,"class":"C8","subject":"NSC"},
            {"day":"Tuesday","lecture":3,"class":"IT-6","subject":"OS"},
            {"day":"Tuesday","lecture":5,"class":"C8","subject":"NSC"},
            {"day":"Wednesday","lecture":4,"class":"IT-6","subject":"DS"},
            {"day":"Thursday","lecture":1,"class":"C8","subject":"NSC"},
            {"day":"Thursday","lecture":4,"class":"IT-6","subject":"OS"},
            {"day":"Friday","lecture":4,"class":"IT-6","subject":"DS"},
            {"day":"Friday","lecture":5,"class":"C8","subject":"NSC"}
          ];
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T05 (GK)
        if (f.id === 'T05') {
          const schedule = [
            {"day":"Monday","lecture":5,"class":"C7","subject":"DMW"},
            {"day":"Monday","lecture":6,"class":"C6","subject":"DMW Lab"},
            {"day":"Tuesday","lecture":4,"class":"C7","subject":"DMW"},
            {"day":"Wednesday","lecture":2,"class":"C6","subject":"MPMC"},
            {"day":"Wednesday","lecture":6,"class":"C7","subject":"DMW"},
            {"day":"Thursday","lecture":2,"class":"C6","subject":"MPMC"},
            {"day":"Thursday","lecture":5,"class":"C6","subject":"DMW Lab"},
            {"day":"Friday","lecture":1,"class":"C6","subject":"MPMC"},
            {"day":"Friday","lecture":5,"class":"C7","subject":"DMW"}
          ];
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T06 (SH)
        if (f.id === 'T06') {
          const schedule = [
            {"day":"Monday","lecture":4,"class":"IT-6","subject":"DS"},
            {"day":"Monday","lecture":6,"class":"C5","subject":"AI"},
            {"day":"Tuesday","lecture":5,"class":"IT-6","subject":"OS"},
            {"day":"Wednesday","lecture":3,"class":"C5","subject":"AI"},
            {"day":"Wednesday","lecture":7,"class":"IT-6","subject":"DS"},
            {"day":"Thursday","lecture":2,"class":"IT-6","subject":"OS"},
            {"day":"Thursday","lecture":7,"class":"C5","subject":"AI"},
            {"day":"Friday","lecture":3,"class":"IT-6","subject":"DS"},
            {"day":"Friday","lecture":6,"class":"C5","subject":"AI"}
          ];
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T07 (KK)
        if (f.id === 'T07') {
          const schedule = [
            {"day":"Monday","lecture":2,"class":"C7","subject":"DMW"},
            {"day":"Monday","lecture":5,"class":"IT-8","subject":"STQA"},
            {"day":"Tuesday","lecture":3,"class":"C7","subject":"DMW"},
            {"day":"Tuesday","lecture":6,"class":"IT-8","subject":"STQA"},
            {"day":"Wednesday","lecture":5,"class":"C7","subject":"DMW"},
            {"day":"Thursday","lecture":1,"class":"IT-8","subject":"STQA"},
            {"day":"Thursday","lecture":3,"class":"C7","subject":"DMW"},
            {"day":"Friday","lecture":2,"class":"IT-8","subject":"STQA"},
            {"day":"Friday","lecture":5,"class":"C7","subject":"DMW"}
          ];
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T08 (SK)
        if (f.id === 'T08') {
          const schedule = [
            {"day":"Monday","lecture":4,"class":"C6","subject":"MPMC"},
            {"day":"Monday","lecture":7,"class":"C8","subject":"NSC"},
            {"day":"Tuesday","lecture":2,"class":"C8","subject":"NSC"},
            {"day":"Tuesday","lecture":4,"class":"C6","subject":"MPMC"},
            {"day":"Wednesday","lecture":1,"class":"C6","subject":"MPMC"},
            {"day":"Wednesday","lecture":4,"class":"C8","subject":"NSC"},
            {"day":"Thursday","lecture":3,"class":"C6","subject":"MPMC"},
            {"day":"Friday","lecture":2,"class":"C6","subject":"MPMC"},
            {"day":"Friday","lecture":7,"class":"C8","subject":"NSC"}
          ];
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T09 (GWS)
        if (f.id === 'T09') {
          const schedule = [
            {"day":"Monday","lecture":2,"class":"C5","subject":"CD"},
            {"day":"Monday","lecture":4,"class":"IT-8","subject":"SPM"},
            {"day":"Tuesday","lecture":5,"class":"IT-8","subject":"SPM"},
            {"day":"Wednesday","lecture":2,"class":"C5","subject":"CD"},
            {"day":"Wednesday","lecture":5,"class":"IT-8","subject":"SPM"},
            {"day":"Thursday","lecture":2,"class":"IT-8","subject":"SPM"},
            {"day":"Thursday","lecture":6,"class":"C5","subject":"CD"},
            {"day":"Friday","lecture":1,"class":"C5","subject":"CD"},
            {"day":"Friday","lecture":4,"class":"IT-8","subject":"SPM"}
          ];
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T10 (GMS)
        if (f.id === 'T10') {
          const schedule = [
            {"day":"Monday","lecture":1,"class":"C8","subject":"NSC"},
            {"day":"Monday","lecture":3,"class":"C5","subject":"CD"},
            {"day":"Tuesday","lecture":2,"class":"C5","subject":"CD"},
            {"day":"Tuesday","lecture":5,"class":"C8","subject":"NSC"},
            {"day":"Wednesday","lecture":3,"class":"C8","subject":"NSC"},
            {"day":"Thursday","lecture":4,"class":"C5","subject":"CD"},
            {"day":"Thursday","lecture":6,"class":"C8","subject":"NSC"},
            {"day":"Friday","lecture":3,"class":"C5","subject":"CD"},
            {"day":"Friday","lecture":6,"class":"C8","subject":"NSC"}
          ];
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T13 (AG)
        if (f.id === 'T13') {
          const schedule = [
            {"day":"Monday","lecture":2,"class":"C8","subject":"NSC"},
            {"day":"Monday","lecture":5,"class":"IT-6","subject":"DS"},
            {"day":"Tuesday","lecture":3,"class":"C8","subject":"NSC"},
            {"day":"Tuesday","lecture":6,"class":"IT-6","subject":"OS"},
            {"day":"Wednesday","lecture":1,"class":"IT-6","subject":"OS"},
            {"day":"Wednesday","lecture":5,"class":"C8","subject":"NSC"},
            {"day":"Thursday","lecture":1,"class":"C8","subject":"NSC"},
            {"day":"Thursday","lecture":4,"class":"IT-6","subject":"DS"},
            {"day":"Friday","lecture":4,"class":"C8","subject":"NSC"},
            {"day":"Friday","lecture":5,"class":"IT-6","subject":"DS"}
          ];
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T14 (NKH)
        if (f.id === 'T14') {
          const schedule = [
            {"day":"Monday","lecture":1,"class":"C7","subject":"DMW"},
            {"day":"Monday","lecture":6,"class":"C6","subject":"MPMC"},
            {"day":"Tuesday","lecture":4,"class":"C6","subject":"MPMC"},
            {"day":"Wednesday","lecture":2,"class":"C7","subject":"DMW"},
            {"day":"Wednesday","lecture":6,"class":"C6","subject":"MPMC"},
            {"day":"Thursday","lecture":2,"class":"C7","subject":"DMW"},
            {"day":"Thursday","lecture":5,"class":"C6","subject":"MPMC"},
            {"day":"Friday","lecture":1,"class":"C6","subject":"MPMC"},
            {"day":"Friday","lecture":3,"class":"C7","subject":"DMW"}
          ];
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T15 (SS)
        if (f.id === 'T15') {
          const schedule = [
            {"day":"Monday","lecture":3,"class":"C7","subject":"DMW"},
            {"day":"Monday","lecture":4,"class":"IT-8","subject":"SPM"},
            {"day":"Tuesday","lecture":2,"class":"C7","subject":"DMW"},
            {"day":"Tuesday","lecture":7,"class":"IT-8","subject":"STQA"},
            {"day":"Wednesday","lecture":2,"class":"IT-8","subject":"SPM"},
            {"day":"Thursday","lecture":3,"class":"IT-8","subject":"STQA"},
            {"day":"Thursday","lecture":6,"class":"C7","subject":"DMW"},
            {"day":"Friday","lecture":2,"class":"C7","subject":"DMW"},
            {"day":"Friday","lecture":6,"class":"IT-8","subject":"SPM"}
          ];
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        // REAL DATA FOR T16 (MK)
        if (f.id === 'T16') {
          const schedule = [
            {"day":"Monday","lecture":3,"class":"C6","subject":"MPMC"},
            {"day":"Monday","lecture":5,"class":"IT-8","subject":"STQA"},
            {"day":"Tuesday","lecture":4,"class":"IT-8","subject":"STQA"},
            {"day":"Wednesday","lecture":3,"class":"C6","subject":"MPMC"},
            {"day":"Wednesday","lecture":7,"class":"IT-8","subject":"STQA"},
            {"day":"Thursday","lecture":2,"class":"C6","subject":"MPMC"},
            {"day":"Thursday","lecture":6,"class":"IT-8","subject":"STQA"},
            {"day":"Friday","lecture":4,"class":"C6","subject":"MPMC"},
            {"day":"Friday","lecture":7,"class":"IT-8","subject":"STQA"}
          ];
          const match = schedule.find(s => s.day.toLowerCase() === day && s.lecture === slot);
          if (match) {
            subject = match.subject;
            className = match.class;
          }
        }

        timetable[day].push({ slot, subject, class: className });
      }
    });
  });

  return {
    name: `${f.initials} (${f.id})`,
    email: `${f.id.toLowerCase()}@global.edu`,
    password: 'password123',
    department: 'Computer Science',
    role: 'teacher',
    profileSetup: true,
    timetable
  };
});

const adminUser = {
  name: 'Dr. Admin',
  email: 'admin1@global.edu',
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
  try {
    const existingUsers = await apiCall('/users');

    let needsTuesdayFix = false;
    for (const u of existingUsers) {
      if (u.timetable?.tuesday?.some(s => s.slot === 7 || s.slot === 8)) {
        needsTuesdayFix = true;
        break;
      }
    }

    let needsT01Update = false;
    const t01 = existingUsers.find(u => u.email === 't01@global.edu');
    if (t01 && t01.timetable?.monday?.some(s => s.subject === 'Class')) {
      needsT01Update = true;
    }

    let needsSubjectUpdate = existingUsers.some(u => 
      Object.values(u.timetable || {}).flat().some(s => s.subject === 'Lecture')
    );

    let needsT11Update = false;
    const t11 = existingUsers.find(u => u.email === 't11@global.edu');
    if (t11 && !t11.timetable?.monday?.some(s => s.subject === 'MPMC')) {
      needsT11Update = true;
    }

    let needsT02Update = false;
    const t02 = existingUsers.find(u => u.email === 't02@global.edu');
    if (t02 && !t02.timetable?.monday?.some(s => s.subject === 'DMW')) {
      needsT02Update = true;
    }

    let needsT12Update = false;
    const t12 = existingUsers.find(u => u.email === 't12@global.edu');
    if (t12 && !t12.timetable?.monday?.some(s => s.subject === 'DS')) {
      needsT12Update = true;
    }

    if (needsTuesdayFix || needsT01Update || needsSubjectUpdate || needsT11Update || needsT02Update || needsT12Update || existingUsers.length === 0) {
      console.log('Migrating: clearing old data to ensure Tuesday 7 & 8 are entirely free...');
      await apiCall('/users/clear', 'POST');
      await apiCall('/leaves/clear', 'POST');
      await apiCall('/substitutionRequests/clear', 'POST');

      // Seed 3 admins
      const admins = [
        { name: 'Admin 1', email: 'admin1@global.edu', password: 'admin123' },
        { name: 'Admin 2', email: 'admin2@global.edu', password: 'admin123' },
        { name: 'Admin 3', email: 'admin3@global.edu', password: 'admin123' },
      ];

      for (const a of admins) {
        await apiCall('/users', 'POST', {
          name: a.name,
          email: a.email,
          password: a.password,
          department: 'Administration',
          role: 'admin',
          profileSetup: true,
          timetable: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] },
        });
        console.log(`Created admin: ${a.name}`);
      }

      // Seed teachers
      for (const teacher of sampleTeachers) {
        await apiCall('/users', 'POST', {
          name: teacher.name,
          email: teacher.email,
          password: teacher.password,
          department: teacher.department,
          role: teacher.role,
          profileSetup: teacher.profileSetup,
          timetable: teacher.timetable,
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
      const allUsers = await apiCall('/users');

      let updatedCount = 0;

      const nonAdminUsers = allUsers.filter(u => u.role !== 'admin').map(u => {
        let changed = false;
        let newName = u.name;
        let newEmail = u.email;
        
        if (u.email === 't06@global.edu') {
          if (!newName.includes('SH (T06)')) { newName = 'SH (T06)'; changed = true; }
        }
        if (u.email === 't07@global.edu') {
          if (!newName.includes('KK (T07)')) { newName = 'KK (T07)'; changed = true; }
        }
        if (u.email === 't12@global.edu') {
          if (!newName.includes('NS (T12)')) { newName = 'NS (T12)'; changed = true; }
        }
        
        // Final cleanup for any KKK/KKKK accidentally created
        if (newName.includes('KKK')) { 
          if (u.email === 't07@global.edu') newName = 'KK (T07)';
          changed = true; 
        }

        // Migrate ALL faculty/users to @global.edu (Catch-all for any stragglers)
        if (u.email && u.email.endsWith('@college.edu')) {
          newEmail = u.email.replace('@college.edu', '@global.edu');
          changed = true;
        }

        if (changed) {
          updatedCount++;
          return { ...u, name: newName, email: newEmail };
        }
        return u;
      });

      let existingAdmins = allUsers.filter(u => u.role === 'admin' && u.email.endsWith('@global.edu'));
      if (existingAdmins.length === 0) {
        existingAdmins = [
          { _id: 'admin1_' + Date.now().toString(), name: 'Admin 1', email: 'admin1@global.edu', password: 'admin123', department: 'Administration', role: 'admin', profileSetup: true, timetable: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] }, createdAt: new Date().toISOString() },
          { _id: 'admin2_' + Date.now().toString(), name: 'Admin 2', email: 'admin2@global.edu', password: 'admin123', department: 'Administration', role: 'admin', profileSetup: true, timetable: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] }, createdAt: new Date().toISOString() },
          { _id: 'admin3_' + Date.now().toString(), name: 'Admin 3', email: 'admin3@global.edu', password: 'admin123', department: 'Administration', role: 'admin', profileSetup: true, timetable: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] }, createdAt: new Date().toISOString() }
        ];
      }

      console.log(`Migrated initials for ${updatedCount} users. Existing admins preserved.`);
      
      // Only re-insert if we made changes during migration
      if (updatedCount > 0) {
        for (const user of [...nonAdminUsers, ...existingAdmins]) {
          await apiCall('/users', 'POST', {
            name: user.name,
            email: user.email,
            password: user.password || 'password123',
            department: user.department,
            role: user.role,
            profileSetup: user.profileSetup,
            timetable: user.timetable,
          });
        }
      }

      // Auto-login logic removed to ensure security
    }

    return true;
  } catch (error) {
    console.error("Seeding Error:", error);
    return false;
  }
};

