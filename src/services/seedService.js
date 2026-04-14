import { localCollection } from '../utils/localDb';

const usersCollection = localCollection('users');

const sampleTeachers = [
  {
    name: 'Prof. Rajesh Kumar',
    email: 'rajesh@college.edu',
    password: 'password123',
    department: 'Computer Science',
    timetable: {
      monday: [
        { slot: 1, subject: 'Data Structures' },
        { slot: 3, subject: 'Algorithms' },
        { slot: 5, subject: 'DS Lab' },
        { slot: 6, subject: 'DS Lab' }
      ],
      tuesday: [
        { slot: 2, subject: 'Data Structures' },
        { slot: 4, subject: 'Algorithms' },
        { slot: 7, subject: 'Programming in C' }
      ],
      wednesday: [
        { slot: 1, subject: 'Algorithms' },
        { slot: 3, subject: 'Data Structures' },
        { slot: 5, subject: 'Programming in C' }
      ],
      thursday: [
        { slot: 2, subject: 'Data Structures' },
        { slot: 4, subject: 'Algorithms' },
        { slot: 6, subject: 'DS Lab' }
      ],
      friday: [
        { slot: 1, subject: 'Programming in C' },
        { slot: 3, subject: 'Data Structures' },
        { slot: 8, subject: 'Algorithms' }
      ],
      saturday: [
        { slot: 1, subject: 'Data Structures' },
        { slot: 2, subject: 'Algorithms' }
      ]
    }
  },
  {
    name: 'Prof. Priya Sharma',
    email: 'priya@college.edu',
    password: 'password123',
    department: 'Computer Science',
    timetable: {
      monday: [{ slot: 2, subject: 'Database Management' }, { slot: 4, subject: 'Software Engineering' }],
      tuesday: [{ slot: 1, subject: 'Database Management' }, { slot: 3, subject: 'Software Engineering' }],
      wednesday: [{ slot: 2, subject: 'Software Engineering' }, { slot: 4, subject: 'Database Management' }],
      thursday: [{ slot: 1, subject: 'Web Development' }, { slot: 3, subject: 'Database Management' }],
      friday: [{ slot: 2, subject: 'Database Management' }, { slot: 4, subject: 'Software Engineering' }],
      saturday: [{ slot: 3, subject: 'Software Engineering' }]
    }
  },
  {
    name: 'Prof. Amit Patel',
    email: 'amit@college.edu',
    password: 'password123',
    department: 'Computer Science',
    timetable: {
      monday: [{ slot: 1, subject: 'Operating Systems' }, { slot: 3, subject: 'Computer Networks' }],
      tuesday: [{ slot: 2, subject: 'Operating Systems' }, { slot: 5, subject: 'Computer Networks' }],
      wednesday: [{ slot: 1, subject: 'Computer Networks' }, { slot: 4, subject: 'Operating Systems' }],
      thursday: [{ slot: 3, subject: 'Computer Networks' }, { slot: 5, subject: 'Operating Systems' }],
      friday: [{ slot: 1, subject: 'Operating Systems' }, { slot: 4, subject: 'Computer Networks' }],
      saturday: [{ slot: 1, subject: 'Operating Systems' }, { slot: 4, subject: 'Computer Networks' }]
    }
  }
];

export const seedDatabase = async () => {
  console.log('Checking database and seeding if needed...');
  try {
    const existingUsers = usersCollection.getAll();
    if (existingUsers.length === 0) {
      console.log('Seeding Database with sample teachers...');
      for (const teacher of sampleTeachers) {
        const newUserData = {
          name: teacher.name,
          email: teacher.email,
          password: teacher.password, // Stored raw for demo purposes
          department: teacher.department,
          timetable: teacher.timetable,
          createdAt: new Date().toISOString()
        };
        usersCollection.add(newUserData);
        console.log(`Created: ${teacher.name}`);
      }
    } else {
      console.log('Database already has users.');
    }
    
    // Always check for auto-login if session is missing
    const authData = localStorage.getItem('currentUser');
    if (!authData) {
      const users = usersCollection.getAll();
      if (users.length > 0) {
        localStorage.setItem('currentUser', JSON.stringify({ uid: users[0]._id }));
        console.log('Auto-logged in as primary professor.');
        // If we are already on a page that needs user data, a reload might be needed,
        // but since this runs in main.jsx before render, it should be fine.
      }
    }
    return true;
  } catch (error) {
    console.error("Seeding/Auto-login Error:", error);
    return false;
  }
};
