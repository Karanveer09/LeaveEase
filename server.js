import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'leaveease.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    _id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT,
    department TEXT,
    employeeId TEXT,
    timetable TEXT DEFAULT '[]',
    profileSetup INTEGER DEFAULT 0,
    lastActive TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS leaves (
    _id TEXT PRIMARY KEY,
    applicantId TEXT,
    date TEXT,
    reason TEXT,
    lecturesOnLeave TEXT,
    type TEXT,
    status TEXT DEFAULT 'pending',
    documentProof TEXT,
    isSubstitutionOnly INTEGER DEFAULT 0,
    createdAt TEXT,
    FOREIGN KEY (applicantId) REFERENCES users (_id)
  );

  CREATE TABLE IF NOT EXISTS substitutionRequests (
    _id TEXT PRIMARY KEY,
    leaveId TEXT,
    fromTeacherId TEXT,
    substituteTeacherId TEXT,
    lectureSlot TEXT,
    subject TEXT,
    class TEXT,
    date TEXT,
    status TEXT DEFAULT 'pending',
    rejectionReason TEXT,
    createdAt TEXT,
    FOREIGN KEY (leaveId) REFERENCES leaves (_id),
    FOREIGN KEY (fromTeacherId) REFERENCES users (_id),
    FOREIGN KEY (substituteTeacherId) REFERENCES users (_id)
  );

  CREATE TABLE IF NOT EXISTS passwordResetRequests (
    _id TEXT PRIMARY KEY,
    email TEXT,
    teacherName TEXT,
    role TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS holidays (
    _id TEXT PRIMARY KEY,
    date TEXT,
    name TEXT,
    type TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS timetableOverrides (
    _id TEXT PRIMARY KEY,
    date TEXT,
    period TEXT,
    originalTeacherId TEXT,
    substituteTeacherId TEXT,
    reason TEXT,
    createdAt TEXT,
    FOREIGN KEY (originalTeacherId) REFERENCES users (_id),
    FOREIGN KEY (substituteTeacherId) REFERENCES users (_id)
  );
`);

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const ensureColumn = (table, column, definition) => {
  const info = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!info.some(col => col.name === column)) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
};

ensureColumn('users', 'timetable', "TEXT DEFAULT '[]'");
ensureColumn('users', 'profileSetup', 'INTEGER DEFAULT 0');
ensureColumn('users', 'lastActive', 'TEXT');
ensureColumn('substitutionRequests', 'rejectionReason', 'TEXT');
ensureColumn('leaves', 'isSubstitutionOnly', 'INTEGER DEFAULT 0');
ensureColumn('timetableOverrides', 'followsDay', 'TEXT');
ensureColumn('leaves', 'cancelledAt', 'TEXT');
ensureColumn('users', 'linkedTeacherId', 'TEXT');

const defaultTimetable = { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] };
const normalizeLeave = (leave) => {
  if (!leave) return null;
  let lecturesOnLeave = [];
  try {
    lecturesOnLeave = leave.lecturesOnLeave ? JSON.parse(leave.lecturesOnLeave) : [];
  } catch {
    lecturesOnLeave = [];
  }
  return {
    ...leave,
    lecturesOnLeave,
    isSubstitutionOnly: Boolean(leave.isSubstitutionOnly),
  };
};

const normalizeUser = (user) => {
  if (!user) return null;
  let timetable = defaultTimetable;
  try {
    timetable = user.timetable ? JSON.parse(user.timetable) : defaultTimetable;
  } catch {
    timetable = defaultTimetable;
  }
  return {
    ...user,
    timetable,
    profileSetup: Boolean(user.profileSetup),
  };
};

const normalizeSubstitutionRequest = (request) => {
  if (!request) return null;
  return {
    ...request,
    lectureSlot: request.lectureSlot !== undefined && request.lectureSlot !== null
      ? Number(request.lectureSlot)
      : request.lectureSlot,
  };
};

// Users
app.get('/api/users', (req, res) => {
  const stmt = db.prepare('SELECT * FROM users');
  const users = stmt.all().map(normalizeUser);
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM users WHERE _id = ?');
  const user = normalizeUser(stmt.get(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/users', (req, res) => {
  const { email, password, name, role, department, employeeId, timetable, profileSetup } = req.body;
  const _id = generateId();
  const normalizedTimetable = JSON.stringify(timetable || defaultTimetable);
  const normalizedProfileSetup = profileSetup ? 1 : 0;
  const stmt = db.prepare(`
    INSERT INTO users (_id, email, password, name, role, department, employeeId, timetable, profileSetup, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  try {
    stmt.run(
      _id,
      email,
      password,
      name,
      role,
      department,
      employeeId,
      normalizedTimetable,
      normalizedProfileSetup,
      new Date().toISOString()
    );
    res.status(201).json({
      _id,
      email,
      password,
      name,
      role,
      department,
      employeeId,
      timetable: JSON.parse(normalizedTimetable),
      profileSetup: Boolean(normalizedProfileSetup),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE _id = ?');
    const user = stmt.get(req.params.id);
    if (user) {
      const updateFields = [];
      const values = [];
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          let value = req.body[key];
          if (key === 'timetable') {
            value = JSON.stringify(value);
          }
          if (key === 'profileSetup') {
            value = req.body[key] ? 1 : 0;
          }
          updateFields.push(`"${key}" = ?`);
          values.push(value);
        }
      });
      values.push(req.params.id);
      const updateStmt = db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE _id = ?`);
      updateStmt.run(...values);
      const updatedUser = normalizeUser({ ...user, ...req.body, timetable: req.body.timetable ? JSON.stringify(req.body.timetable) : user.timetable, profileSetup: req.body.profileSetup !== undefined ? (req.body.profileSetup ? 1 : 0) : user.profileSetup });
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM users WHERE _id = ?');
  const result = stmt.run(req.params.id);
  if (result.changes > 0) {
    res.json({ message: 'User deleted' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/users/clear', (req, res) => {
  try {
    db.pragma('foreign_keys = OFF');
    db.prepare('DELETE FROM timetableOverrides').run();
    db.prepare('DELETE FROM substitutionRequests').run();
    db.prepare('DELETE FROM leaves').run();
    db.prepare('DELETE FROM users').run();
    db.pragma('foreign_keys = ON');
    res.json({ message: 'Users cleared' });
  } catch (error) {
    db.pragma('foreign_keys = ON');
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/leaves/clear', (req, res) => {
  try {
    db.pragma('foreign_keys = OFF');
    db.prepare('DELETE FROM substitutionRequests').run();
    db.prepare('DELETE FROM leaves').run();
    db.pragma('foreign_keys = ON');
    res.json({ message: 'Leaves cleared' });
  } catch (error) {
    db.pragma('foreign_keys = ON');
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/substitutionRequests/clear', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM substitutionRequests');
    stmt.run();
    res.json({ message: 'Substitution requests cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leaves
app.get('/api/leaves', (req, res) => {
  const stmt = db.prepare('SELECT * FROM leaves');
  const leaves = stmt.all().map(normalizeLeave);
  res.json(leaves);
});

app.get('/api/leaves/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM leaves WHERE _id = ?');
  const leave = normalizeLeave(stmt.get(req.params.id));
  if (leave) {
    res.json(leave);
  } else {
    res.status(404).json({ error: 'Leave not found' });
  }
});

app.post('/api/leaves', (req, res) => {
  const { applicantId, date, reason, lecturesOnLeave, type, documentProof, isSubstitutionOnly } = req.body;
  const _id = generateId();
  const stmt = db.prepare(`
    INSERT INTO leaves (_id, applicantId, date, reason, lecturesOnLeave, type, status, documentProof, isSubstitutionOnly, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
  `);
  try {
    stmt.run(_id, applicantId, date, reason, JSON.stringify(lecturesOnLeave || []), type, documentProof, isSubstitutionOnly ? 1 : 0, new Date().toISOString());
    console.log('Leave created:', _id);
    res.status(201).json({ _id, applicantId, date, reason, lecturesOnLeave: lecturesOnLeave || [], type, status: 'pending', documentProof, isSubstitutionOnly, createdAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error creating leave:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/leaves/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM leaves WHERE _id = ?');
    const leave = stmt.get(req.params.id);
    if (leave) {
      // Auto-set cancelledAt when status changes to cancelled
      if (req.body.status === 'cancelled' && leave.status !== 'cancelled') {
        req.body.cancelledAt = new Date().toISOString();
      }

      const updateFields = [];
      const values = [];
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          let value = req.body[key];
          if (key === 'lecturesOnLeave') {
            value = JSON.stringify(value);
          }
          updateFields.push(`"${key}" = ?`);
          values.push(value);
        }
      });
      values.push(req.params.id);
      const updateStmt = db.prepare(`UPDATE leaves SET ${updateFields.join(', ')} WHERE _id = ?`);
      updateStmt.run(...values);
      const updatedLeave = normalizeLeave({ ...leave, ...req.body, lecturesOnLeave: req.body.lecturesOnLeave ? JSON.stringify(req.body.lecturesOnLeave) : leave.lecturesOnLeave });
      res.json(updatedLeave);
    } else {
      res.status(404).json({ error: 'Leave not found' });
    }
  } catch (error) {
    console.error('Error updating leave:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/leaves/:id', (req, res) => {
  const deleteRequestsStmt = db.prepare('DELETE FROM substitutionRequests WHERE leaveId = ?');
  deleteRequestsStmt.run(req.params.id);

  const stmt = db.prepare('DELETE FROM leaves WHERE _id = ?');
  const result = stmt.run(req.params.id);
  if (result.changes > 0) {
    res.json({ message: 'Leave deleted' });
  } else {
    res.status(404).json({ error: 'Leave not found' });
  }
});

// Substitution Requests
app.get('/api/substitutionRequests', (req, res) => {
  const stmt = db.prepare('SELECT * FROM substitutionRequests');
  const requests = stmt.all().map(normalizeSubstitutionRequest);
  res.json(requests);
});

app.get('/api/substitutionRequests/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM substitutionRequests WHERE _id = ?');
  const request = normalizeSubstitutionRequest(stmt.get(req.params.id));
  if (request) {
    res.json(request);
  } else {
    res.status(404).json({ error: 'Substitution request not found' });
  }
});

app.post('/api/substitutionRequests', (req, res) => {
  const { leaveId, fromTeacherId, substituteTeacherId, lectureSlot, subject, class: className, date } = req.body;
  const _id = generateId();
  const stmt = db.prepare(`
    INSERT INTO substitutionRequests (_id, leaveId, fromTeacherId, substituteTeacherId, lectureSlot, subject, "class", date, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `);
  try {
    stmt.run(_id, leaveId, fromTeacherId, substituteTeacherId, lectureSlot, subject, className, date, new Date().toISOString());
    console.log('Substitution request created:', _id);
    res.status(201).json(normalizeSubstitutionRequest({ _id, leaveId, fromTeacherId, substituteTeacherId, lectureSlot, subject, class: className, date, status: 'pending', createdAt: new Date().toISOString() }));
  } catch (error) {
    console.error('Error creating substitution request:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/substitutionRequests/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM substitutionRequests WHERE _id = ?');
    const request = stmt.get(req.params.id);
    if (request) {
      const updateFields = [];
      const values = [];
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          updateFields.push(`"${key}" = ?`);
          values.push(req.body[key]);
        }
      });
      values.push(req.params.id);
      const updateStmt = db.prepare(`UPDATE substitutionRequests SET ${updateFields.join(', ')} WHERE _id = ?`);
      updateStmt.run(...values);
      const updatedRequest = normalizeSubstitutionRequest({ ...request, ...req.body });
      res.json(updatedRequest);
    } else {
      res.status(404).json({ error: 'Substitution request not found' });
    }
  } catch (error) {
    console.error('Error updating substitution request:', error);
    res.status(500).json({ error: error.message });
  }
});

// Holidays
app.get('/api/holidays', (req, res) => {
  const stmt = db.prepare('SELECT * FROM holidays');
  const holidays = stmt.all();
  res.json(holidays);
});

app.post('/api/holidays', (req, res) => {
  const { date, name, type } = req.body;
  const _id = generateId();
  const stmt = db.prepare(`
    INSERT INTO holidays (_id, date, name, type, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);
  try {
    stmt.run(_id, date, name, type, new Date().toISOString());
    res.status(201).json({ _id, date, name, type, createdAt: new Date().toISOString() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/holidays/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM holidays WHERE _id = ?');
    const holiday = stmt.get(req.params.id);
    if (holiday) {
      const updateFields = [];
      const values = [];
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          updateFields.push(`"${key}" = ?`);
          values.push(req.body[key]);
        }
      });
      values.push(req.params.id);
      const updateStmt = db.prepare(`UPDATE holidays SET ${updateFields.join(', ')} WHERE _id = ?`);
      updateStmt.run(...values);
      const updatedHoliday = { ...holiday, ...req.body };
      res.json(updatedHoliday);
    } else {
      res.status(404).json({ error: 'Holiday not found' });
    }
  } catch (error) {
    console.error('Error updating holiday:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/holidays/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM holidays WHERE _id = ?');
  const result = stmt.run(req.params.id);
  if (result.changes > 0) {
    res.json({ message: 'Holiday deleted' });
  } else {
    res.status(404).json({ error: 'Holiday not found' });
  }
});

// Timetable Overrides
app.get('/api/timetableOverrides', (req, res) => {
  const stmt = db.prepare('SELECT * FROM timetableOverrides');
  const overrides = stmt.all();
  res.json(overrides);
});

app.post('/api/timetableOverrides', (req, res) => {
  const { date, period, originalTeacherId, substituteTeacherId, reason, followsDay } = req.body;
  const _id = generateId();
  const stmt = db.prepare(`
    INSERT INTO timetableOverrides (_id, date, period, originalTeacherId, substituteTeacherId, reason, followsDay, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  try {
    stmt.run(_id, date, period, originalTeacherId, substituteTeacherId, reason, followsDay, new Date().toISOString());
    res.status(201).json({ _id, date, period, originalTeacherId, substituteTeacherId, reason, followsDay, createdAt: new Date().toISOString() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/timetableOverrides/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM timetableOverrides WHERE _id = ?');
    const override = stmt.get(req.params.id);
    if (override) {
      const updateFields = [];
      const values = [];
      Object.keys(req.body).forEach(key => {
        if (req.body[key] !== undefined) {
          updateFields.push(`"${key}" = ?`);
          values.push(req.body[key]);
        }
      });
      values.push(req.params.id);
      const updateStmt = db.prepare(`UPDATE timetableOverrides SET ${updateFields.join(', ')} WHERE _id = ?`);
      updateStmt.run(...values);
      const updatedOverride = { ...override, ...req.body };
      res.json(updatedOverride);
    } else {
      res.status(404).json({ error: 'Timetable override not found' });
    }
  } catch (error) {
    console.error('Error updating timetable override:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/timetableOverrides/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM timetableOverrides WHERE _id = ?');
  const result = stmt.run(req.params.id);
  if (result.changes > 0) {
    res.json({ message: 'Timetable override deleted' });
  } else {
    res.status(404).json({ error: 'Timetable override not found' });
  }
});

// Auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?');
    const user = normalizeUser(stmt.get(email, password));
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Auth login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Password Reset Endpoints
app.post('/api/auth/request-reset', (req, res) => {
  const { email } = req.body;
  const userStmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = userStmt.get(email);
  
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email.' });
  }
  
  // Special case for Admin 1 -> Developer Notification
  if (email === 'admin1@global.edu') {
    return res.json({ developerMode: true, message: "Password change request has been sent. An automated notification has been delivered to the developer." });
  }
  
  // Check if a pending request already exists
  const existingReq = db.prepare('SELECT * FROM passwordResetRequests WHERE email = ? AND status = ?').get(email, 'pending');
  if (existingReq) {
    return res.json({ message: 'A request is already pending. Please wait for admin approval.' });
  }
  
  // Check if an approved request exists
  const approvedReq = db.prepare('SELECT * FROM passwordResetRequests WHERE email = ? AND status = ?').get(email, 'approved');
  if (approvedReq) {
    return res.json({ message: 'Your request has been approved. You can set a new password now.' });
  }
  
  // Store the password reset request
  const _id = generateId();
  db.prepare('INSERT INTO passwordResetRequests (_id, email, teacherName, role, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
    _id, email, user.name, user.role, 'pending', new Date().toISOString()
  );
  
  res.json({ message: 'Password reset request submitted successfully. Please wait for admin approval.' });
});

app.get('/api/auth/reset-status/:email', (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const reqStmt = db.prepare('SELECT * FROM passwordResetRequests WHERE email = ? ORDER BY createdAt DESC LIMIT 1');
  const request = reqStmt.get(email);
  res.json(request || null);
});

app.post('/api/auth/submit-password', (req, res) => {
  const { email, newPassword } = req.body;
  const userStmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = userStmt.get(email);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  
  if (email === 'admin1@global.edu') {
    return res.status(403).json({ error: "Security Restriction: Admin 1 password can only be changed by the developer." });
  }
  
  // Verify an approved request exists
  const approvedReq = db.prepare('SELECT * FROM passwordResetRequests WHERE email = ? AND status = ?').get(email, 'approved');
  if (!approvedReq) {
    return res.status(403).json({ error: 'No approved reset request found. Please request admin approval first.' });
  }
  
  const updateStmt = db.prepare('UPDATE users SET password = ? WHERE email = ?');
  updateStmt.run(newPassword, email);
  
  // Clear the approved request
  db.prepare('DELETE FROM passwordResetRequests WHERE email = ?').run(email);
  
  res.json({ message: 'Password updated successfully.' });
});

// Admin Password Request Management
app.get('/api/auth/password-requests', (req, res) => {
  const requests = db.prepare('SELECT * FROM passwordResetRequests ORDER BY createdAt DESC').all();
  res.json(requests);
});

app.post('/api/auth/approve-request/:requestId', (req, res) => {
  const { requestId } = req.params;
  const reqStmt = db.prepare('SELECT * FROM passwordResetRequests WHERE _id = ?');
  const request = reqStmt.get(requestId);
  
  if (!request) {
    return res.status(404).json({ error: 'Request not found.' });
  }
  
  db.prepare('UPDATE passwordResetRequests SET status = ? WHERE _id = ?').run('approved', requestId);
  res.json({ message: 'Password request approved.' });
});

app.delete('/api/auth/clear-request/:requestId', (req, res) => {
  const { requestId } = req.params;
  db.prepare('DELETE FROM passwordResetRequests WHERE _id = ?').run(requestId);
  res.json({ message: 'Password request cleared.' });
});

// Timetable Management
app.put('/api/users/:teacherId/timetable', (req, res) => {
  const { teacherId } = req.params;
  const timetableData = req.body;
  
  const stmt = db.prepare('SELECT * FROM users WHERE _id = ?');
  const user = stmt.get(teacherId);
  
  if (!user) {
    return res.status(404).json({ error: 'Teacher not found.' });
  }
  
  const updateStmt = db.prepare('UPDATE users SET timetable = ? WHERE _id = ?');
  updateStmt.run(JSON.stringify(timetableData), teacherId);
  
  res.json({ message: 'Timetable updated successfully.' });
});

// Generic error handler for uncaught server errors
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});