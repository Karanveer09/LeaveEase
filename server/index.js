const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leaves');
const substitutionRoutes = require('./routes/substitutions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/substitutions', substitutionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Leave Application Server is running' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // Try connecting to local MongoDB first
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log('✅ Connected to local MongoDB');
    } catch (err) {
      // If local MongoDB is not available, use in-memory MongoDB
      console.log('⚠️  Local MongoDB not found, starting in-memory MongoDB...');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to in-memory MongoDB');
      console.log('⚠️  Note: Data will be lost when the server stops.');

      // Auto-seed the in-memory database
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup error:', err.message);
    process.exit(1);
  }
}

async function seedDatabase() {
  const User = require('./models/User');
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) return;

  console.log('🌱 Seeding database with sample teachers...');

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
        monday: [
          { slot: 2, subject: 'Database Management' },
          { slot: 4, subject: 'Software Engineering' },
          { slot: 7, subject: 'DB Lab' },
          { slot: 8, subject: 'DB Lab' }
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
          { slot: 7, subject: 'CN Lab' }
        ],
        thursday: [
          { slot: 3, subject: 'Computer Networks' },
          { slot: 5, subject: 'Operating Systems' },
          { slot: 8, subject: 'CN Lab' }
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

  for (const teacher of teachers) {
    const user = new User(teacher);
    await user.save();
    console.log(`  ✅ Created: ${teacher.name} (${teacher.email})`);
  }

  console.log('🎉 Database seeded! All passwords: password123');
}

startServer();
