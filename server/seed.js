const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const teachers = [
  {
    name: 'Prof. Rajesh Kumar',
    email: 'rajesh@college.edu',
    password: 'password123',
    department: 'Computer Science',
    timetable: {
      monday: [
        { slot: 1, subject: 'Data Structures' },
        { slot: 3, subject: 'Algorithms' },
        { slot: 5, subject: 'Data Structures Lab' },
        { slot: 6, subject: 'Data Structures Lab' }
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
        { slot: 6, subject: 'Data Structures Lab' }
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
      monday: [
        { slot: 2, subject: 'Database Management' },
        { slot: 4, subject: 'Software Engineering' },
        { slot: 7, subject: 'Database Lab' },
        { slot: 8, subject: 'Database Lab' }
      ],
      tuesday: [
        { slot: 1, subject: 'Database Management' },
        { slot: 3, subject: 'Software Engineering' },
        { slot: 5, subject: 'Web Development' }
      ],
      wednesday: [
        { slot: 2, subject: 'Software Engineering' },
        { slot: 4, subject: 'Database Management' },
        { slot: 6, subject: 'Web Development' }
      ],
      thursday: [
        { slot: 1, subject: 'Web Development' },
        { slot: 3, subject: 'Database Management' },
        { slot: 5, subject: 'Software Engineering' }
      ],
      friday: [
        { slot: 2, subject: 'Database Management' },
        { slot: 4, subject: 'Software Engineering' },
        { slot: 6, subject: 'Web Development' }
      ],
      saturday: [
        { slot: 3, subject: 'Software Engineering' }
      ]
    }
  },
  {
    name: 'Prof. Amit Patel',
    email: 'amit@college.edu',
    password: 'password123',
    department: 'Computer Science',
    timetable: {
      monday: [
        { slot: 1, subject: 'Operating Systems' },
        { slot: 3, subject: 'Computer Networks' },
        { slot: 6, subject: 'OS Lab' }
      ],
      tuesday: [
        { slot: 2, subject: 'Operating Systems' },
        { slot: 5, subject: 'Computer Networks' },
        { slot: 8, subject: 'OS Lab' }
      ],
      wednesday: [
        { slot: 1, subject: 'Computer Networks' },
        { slot: 4, subject: 'Operating Systems' },
        { slot: 7, subject: 'Computer Networks Lab' }
      ],
      thursday: [
        { slot: 3, subject: 'Computer Networks' },
        { slot: 5, subject: 'Operating Systems' },
        { slot: 8, subject: 'Computer Networks Lab' }
      ],
      friday: [
        { slot: 1, subject: 'Operating Systems' },
        { slot: 4, subject: 'Computer Networks' },
        { slot: 7, subject: 'OS Lab' }
      ],
      saturday: [
        { slot: 1, subject: 'Operating Systems' },
        { slot: 4, subject: 'Computer Networks' }
      ]
    }
  },
  {
    name: 'Prof. Sneha Desai',
    email: 'sneha@college.edu',
    password: 'password123',
    department: 'Information Technology',
    timetable: {
      monday: [
        { slot: 2, subject: 'Machine Learning' },
        { slot: 5, subject: 'Artificial Intelligence' },
        { slot: 8, subject: 'ML Lab' }
      ],
      tuesday: [
        { slot: 1, subject: 'Machine Learning' },
        { slot: 4, subject: 'Artificial Intelligence' },
        { slot: 6, subject: 'ML Lab' }
      ],
      wednesday: [
        { slot: 3, subject: 'Artificial Intelligence' },
        { slot: 5, subject: 'Machine Learning' },
        { slot: 8, subject: 'Python Programming' }
      ],
      thursday: [
        { slot: 1, subject: 'Python Programming' },
        { slot: 4, subject: 'Machine Learning' },
        { slot: 7, subject: 'Artificial Intelligence' }
      ],
      friday: [
        { slot: 2, subject: 'Python Programming' },
        { slot: 5, subject: 'Machine Learning' },
        { slot: 6, subject: 'Artificial Intelligence' }
      ],
      saturday: [
        { slot: 2, subject: 'Machine Learning' },
        { slot: 3, subject: 'Python Programming' }
      ]
    }
  },
  {
    name: 'Prof. Vikram Singh',
    email: 'vikram@college.edu',
    password: 'password123',
    department: 'Information Technology',
    timetable: {
      monday: [
        { slot: 3, subject: 'Cloud Computing' },
        { slot: 5, subject: 'Cyber Security' },
        { slot: 7, subject: 'Cloud Lab' }
      ],
      tuesday: [
        { slot: 2, subject: 'Cloud Computing' },
        { slot: 6, subject: 'Cyber Security' },
        { slot: 8, subject: 'Cloud Lab' }
      ],
      wednesday: [
        { slot: 1, subject: 'Cyber Security' },
        { slot: 4, subject: 'Cloud Computing' },
        { slot: 6, subject: 'IoT' }
      ],
      thursday: [
        { slot: 2, subject: 'IoT' },
        { slot: 5, subject: 'Cloud Computing' },
        { slot: 7, subject: 'Cyber Security' }
      ],
      friday: [
        { slot: 3, subject: 'IoT' },
        { slot: 5, subject: 'Cloud Computing' },
        { slot: 8, subject: 'Cyber Security' }
      ],
      saturday: [
        { slot: 1, subject: 'Cloud Computing' },
        { slot: 3, subject: 'IoT' }
      ]
    }
  },
  {
    name: 'Prof. Anita Joshi',
    email: 'anita@college.edu',
    password: 'password123',
    department: 'Electronics',
    timetable: {
      monday: [
        { slot: 1, subject: 'Digital Electronics' },
        { slot: 4, subject: 'Microprocessors' },
        { slot: 7, subject: 'Electronics Lab' }
      ],
      tuesday: [
        { slot: 3, subject: 'Digital Electronics' },
        { slot: 5, subject: 'Microprocessors' },
        { slot: 7, subject: 'Electronics Lab' }
      ],
      wednesday: [
        { slot: 2, subject: 'Microprocessors' },
        { slot: 5, subject: 'Digital Electronics' },
        { slot: 8, subject: 'VLSI Design' }
      ],
      thursday: [
        { slot: 1, subject: 'VLSI Design' },
        { slot: 4, subject: 'Digital Electronics' },
        { slot: 6, subject: 'Microprocessors' }
      ],
      friday: [
        { slot: 2, subject: 'Microprocessors' },
        { slot: 4, subject: 'VLSI Design' },
        { slot: 7, subject: 'Digital Electronics' }
      ],
      saturday: [
        { slot: 2, subject: 'Digital Electronics' },
        { slot: 4, subject: 'VLSI Design' }
      ]
    }
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Insert teachers
    for (const teacher of teachers) {
      const user = new User(teacher);
      await user.save();
      console.log(`✅ Created teacher: ${teacher.name} (${teacher.email})`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials (all passwords: password123):');
    teachers.forEach(t => {
      console.log(`   ${t.name} — ${t.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
