import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'leaveease.db');
const db = new Database(dbPath);

const generateId = () => Math.random().toString(36).substr(2, 9);

// Faculty data
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

// Clear existing data
console.log('Clearing existing data...');
db.prepare('DELETE FROM users').run();
db.prepare('DELETE FROM leaves').run();
db.prepare('DELETE FROM substitutionRequests').run();

// Insert admins
const admins = [
  { name: 'Admin 1', email: 'admin1@global.edu', password: 'admin123' },
  { name: 'Admin 2', email: 'admin2@global.edu', password: 'admin123' },
  { name: 'Admin 3', email: 'admin3@global.edu', password: 'admin123' },
];

const defaultTimetable = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] };

for (const a of admins) {
  const _id = generateId();
  db.prepare(`
    INSERT INTO users (_id, email, password, name, role, department, timetable, profileSetup, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    _id,
    a.email,
    a.password,
    a.name,
    'admin',
    'Administration',
    JSON.stringify(defaultTimetable),
    1,
    new Date().toISOString()
  );
  console.log(`Created admin: ${a.name}`);
}

// Insert teachers
for (const f of rawFaculty) {
  const _id = generateId();
  const timetable = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] };
  
  db.prepare(`
    INSERT INTO users (_id, email, password, name, role, department, timetable, profileSetup, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    _id,
    `${f.id.toLowerCase()}@global.edu`,
    'password123',
    `${f.initials} (${f.id})`,
    'teacher',
    'Computer Science',
    JSON.stringify(timetable),
    1,
    new Date().toISOString()
  );
  console.log(`Created teacher: ${f.initials} (${f.id})`);
}

// Verify seeding
const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get();
console.log(`\n✓ Seeding complete! Total users: ${userCount.c}`);
db.close();
