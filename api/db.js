import Database from 'better-sqlite3'
import { planRoleSync } from './utils/vatusaRoles.js'

// DB_PATH lets a deployment keep the database (and SQLite's -journal file next to it) in a
// mounted directory. Defaults to ./zan.db for local use.
const db = new Database(process.env.DB_PATH || 'zan.db')

// ---------- Endorsements ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS endorsements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cid INTEGER NOT NULL,
    position TEXT NOT NULL,
    granted_by INTEGER NOT NULL,
    granted_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(cid, position)
  )
`)

export function getEndorsements(cid) {
  const rows = db.prepare('SELECT position FROM endorsements WHERE cid = ?').all(cid)
  return rows.map((row) => row.position)
}

export function getAllEndorsements() {
  const rows = db.prepare('SELECT cid, position FROM endorsements').all()
  const result = {}
  for (const row of rows) {
    if (!result[row.cid]) result[row.cid] = []
    result[row.cid].push(row.position)
  }
  return result
}

export function addEndorsement(cid, position, grantedBy) {
  db.prepare(
    'INSERT OR IGNORE INTO endorsements (cid, position, granted_by) VALUES (?, ?, ?)'
  ).run(cid, position, grantedBy)
}

export function removeEndorsement(cid, position) {
  db.prepare('DELETE FROM endorsements WHERE cid = ? AND position = ?').run(cid, position)
}

// ---------- Operating Initials ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS operating_initials (
    cid INTEGER PRIMARY KEY,
    initials TEXT NOT NULL UNIQUE
  )
`)

export function getInitials(cid) {
  const row = db.prepare('SELECT initials FROM operating_initials WHERE cid = ?').get(cid)
  return row?.initials ?? null
}

export function getAllInitials() {
  const rows = db.prepare('SELECT cid, initials FROM operating_initials').all()
  const result = {}
  for (const row of rows) result[row.cid] = row.initials
  return result
}

function isInitialsTaken(initials, excludeCid = null) {
  const row = excludeCid
    ? db.prepare('SELECT 1 FROM operating_initials WHERE initials = ? AND cid != ?').get(initials, excludeCid)
    : db.prepare('SELECT 1 FROM operating_initials WHERE initials = ?').get(initials)
  return !!row
}

export function assignInitialsIfNeeded(cid, fname, lname) {
  const existing = getInitials(cid)
  if (existing) return existing

  // fname/lname come from VATUSA's roster and aren't guaranteed non-blank - a missing or
  // empty name used to crash this on `fname[0]` of null/undefined. A blank name just skips
  // straight to the random fallback below instead.
  const natural = fname?.[0] && lname?.[0] ? (fname[0] + lname[0]).toUpperCase() : null

  if (natural && /^[A-Z]{2}$/.test(natural) && !isInitialsTaken(natural)) {
    db.prepare('INSERT INTO operating_initials (cid, initials) VALUES (?, ?)').run(cid, natural)
    return natural
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let attempt
  let tries = 0
  do {
    const a = letters[Math.floor(Math.random() * 26)]
    const b = letters[Math.floor(Math.random() * 26)]
    attempt = a + b
    tries += 1
    // 676 possible two-letter combinations - if we've somehow tried them all, stop looping
    // forever and let the unique constraint (or a human) sort it out instead.
    if (tries > 1000) throw new Error(`Could not find a free set of initials for cid ${cid}`)
  } while (isInitialsTaken(attempt))

  db.prepare('INSERT INTO operating_initials (cid, initials) VALUES (?, ?)').run(cid, attempt)
  return attempt
}

const REAL_INITIALS = {
  'Thomas Bolger': 'TM',
  'Dan Michael Bonaga': 'MB',
  'Matt Boulanger': 'GG',
  'Joshua Brink': 'JK',
  'Dominic Burjak': 'DB',
  'Jason Calder': 'JC',
  'Chanyn Carbone': 'CC',
  'Adam Comstock': 'AT',
  'Matthew Crawford': 'MC',
  'Brady Curotto': 'BC',
  'Christopher Davis': 'CD',
  'Jake Decker': 'JD',
  'Ian Fisher': 'EN',
  'Alexander Gengler': 'AG',
  'Chad Gurchinoff': 'CG',
  'Daniel Hawton': 'AW',
  'Caleb Henry': 'CH',
  'Derek Hood': 'DH',
  'Kevin Huang': 'KH',
  'Leo Jegasothy': 'JH',
  'Chen Kaiyu': 'CK',
  'Levi Long': 'LL',
  'Alec Main': 'AJ',
  'Sean McHugh': 'SM',
  'Will Mullaney': 'WM',
  'Dylan Neary': 'DN',
  'Alessio Orlando': 'AO',
  'Marvin Palmer': 'MP',
  'Robby Parknavy': 'RP',
  'William Polley': 'WP',
  'Gerardo Rodriguez': 'GR',
  'Alex Seeberger': 'AS',
  'Jim Thompson': 'JT',
  'Hayden Tilby': 'HT',
  'Odinn Tor': 'OT',
  'Stephen Welsh': 'SW',
  'Brandon Wening': 'BW',
  'Vince Winstead': 'VW',
  'Alex Ying': 'AY',
  'David Yoder': 'DY',
  'Greg Young': 'GY',
}

function forceSetInitials(cid, initials) {
  db.prepare('DELETE FROM operating_initials WHERE cid = ?').run(cid)
  db.prepare('DELETE FROM operating_initials WHERE initials = ? AND cid != ?').run(initials, cid)
  db.prepare('INSERT INTO operating_initials (cid, initials) VALUES (?, ?)').run(cid, initials)
}

export function seedRealInitials(cid, fname, lname) {
  const key = `${fname} ${lname}`
  const real = REAL_INITIALS[key]
  if (!real) return false
  if (getInitials(cid) === real) return true
  forceSetInitials(cid, real)
  return true
}

export function setInitials(cid, initials) {
  if (isInitialsTaken(initials, cid)) {
    return { success: false, error: 'Those initials are already taken' }
  }
  db.prepare(
    'INSERT INTO operating_initials (cid, initials) VALUES (?, ?) ON CONFLICT(cid) DO UPDATE SET initials = excluded.initials'
  ).run(cid, initials)
  return { success: true }
}

// ---------- Roles ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cid INTEGER NOT NULL,
    role TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    UNIQUE(cid, role)
  )
`)

// Databases created before role syncing existed don't have the `source` column yet.
// 'manual' = added by hand (seeded, role manager, direct edit); 'vatusa' = added by the
// login sync, and the only kind the sync is allowed to remove again.
if (!db.prepare('PRAGMA table_info(roles)').all().some((c) => c.name === 'source')) {
  db.exec("ALTER TABLE roles ADD COLUMN source TEXT NOT NULL DEFAULT 'manual'")
}

export function getRoles(cid) {
  const rows = db.prepare('SELECT role FROM roles WHERE cid = ?').all(cid)
  return rows.map((r) => r.role)
}

export function getAllRoles() {
  const rows = db.prepare('SELECT cid, role FROM roles').all()
  const result = {}
  for (const row of rows) {
    if (!result[row.cid]) result[row.cid] = []
    result[row.cid].push(row.role)
  }
  return result
}

export function addRole(cid, role) {
  db.prepare('INSERT OR IGNORE INTO roles (cid, role) VALUES (?, ?)').run(cid, role)
}

export function removeRole(cid, role) {
  db.prepare('DELETE FROM roles WHERE cid = ? AND role = ?').run(cid, role)
}

// Mirrors a member's ZAN roles from VATUSA onto this site (see planRoleSync for the rules).
export function syncVatusaRoles(cid, vatusaRoles) {
  const existing = db.prepare('SELECT role, source FROM roles WHERE cid = ?').all(cid)
  const { toAdd, toRemove } = planRoleSync(existing, vatusaRoles)

  const insert = db.prepare("INSERT OR IGNORE INTO roles (cid, role, source) VALUES (?, ?, 'vatusa')")
  const remove = db.prepare("DELETE FROM roles WHERE cid = ? AND role = ? AND source = 'vatusa'")
  db.transaction(() => {
    for (const role of toAdd) insert.run(cid, role)
    for (const role of toRemove) remove.run(cid, role)
  })()

  return { added: toAdd, removed: toRemove }
}

export function seedInitialRoles() {
  addRole(1599990, 'WM')   // Jason Calder
  addRole(1394476, 'ATM')  // Brandon Wening
}

// ---------- Feedback ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    controller_cid INTEGER,
    position TEXT,
    rating TEXT NOT NULL,
    comments TEXT,
    pilot_cid INTEGER NOT NULL,
    pilot_name TEXT NOT NULL,
    pilot_callsign TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

export function submitFeedback({ controllerCid, position, rating, comments, pilotCid, pilotName, pilotCallsign }) {
  db.prepare(`
    INSERT INTO feedback (controller_cid, position, rating, comments, pilot_cid, pilot_name, pilot_callsign)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(controllerCid || null, position || null, rating, comments || null, pilotCid, pilotName, pilotCallsign || null)
}

export function getAllFeedback() {
  return db.prepare('SELECT * FROM feedback ORDER BY created_at DESC').all()
}

export function getReviewedFeedbackForController(cid) {
  return db.prepare(
    "SELECT * FROM feedback WHERE controller_cid = ? AND status = 'reviewed' ORDER BY created_at DESC"
  ).all(cid)
}

export function getFeedbackByPilot(cid) {
  return db.prepare('SELECT * FROM feedback WHERE pilot_cid = ? ORDER BY created_at DESC').all(cid)
}

export function markFeedbackReviewed(id) {
  db.prepare("UPDATE feedback SET status = 'reviewed' WHERE id = ?").run(id)
}

// ---------- Applications ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cid INTEGER NOT NULL,
    fname TEXT NOT NULL,
    lname TEXT NOT NULL,
    email TEXT,
    facility TEXT,
    rating TEXT,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

export function submitApplication({ cid, fname, lname, email, facility, rating, reason }) {
  db.prepare(`
    INSERT INTO applications (cid, fname, lname, email, facility, rating, reason)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(cid, fname, lname, email || null, facility || null, rating || null, reason || null)
}

export function getPendingApplications() {
  return db.prepare("SELECT * FROM applications WHERE status = 'pending' ORDER BY created_at DESC").all()
}

export function hasPendingApplication(cid) {
  return !!db.prepare("SELECT 1 FROM applications WHERE cid = ? AND status = 'pending' LIMIT 1").get(cid)
}

// Returns how many rows changed, so callers can tell "no such application" from success.
export function updateApplicationStatus(id, status) {
  return db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(status, id).changes
}

// ---------- Events ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS event_meta (
    event_id INTEGER PRIMARY KEY,
    hidden INTEGER NOT NULL DEFAULT 1
  )
`)

export function isEventHidden(eventId) {
  const row = db.prepare('SELECT hidden FROM event_meta WHERE event_id = ?').get(eventId)
  return row ? !!row.hidden : true
}

export function setEventHidden(eventId, hidden) {
  db.prepare(`
    INSERT INTO event_meta (event_id, hidden) VALUES (?, ?)
    ON CONFLICT(event_id) DO UPDATE SET hidden = excluded.hidden
  `).run(eventId, hidden ? 1 : 0)
}

db.exec(`
  CREATE TABLE IF NOT EXISTS event_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Local',
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

export function addEventPosition(eventId, name, category, createdBy) {
  db.prepare('INSERT INTO event_positions (event_id, name, category, created_by) VALUES (?, ?, ?, ?)')
    .run(eventId, name, category, createdBy)
}

export function removeEventPosition(id) {
  db.prepare('DELETE FROM event_positions WHERE id = ?').run(id)
  db.prepare('DELETE FROM event_signups WHERE position_id = ?').run(id)
}

export function getPositionsForEvent(eventId) {
  return db.prepare('SELECT * FROM event_positions WHERE event_id = ? ORDER BY created_at ASC').all(eventId)
}

export function getEventPosition(id) {
  return db.prepare('SELECT * FROM event_positions WHERE id = ?').get(id)
}

db.exec(`
  CREATE TABLE IF NOT EXISTS event_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    position_id INTEGER NOT NULL,
    cid INTEGER NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    signed_up_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(position_id, cid)
  )
`)

export function signUpForPosition({ eventId, positionId, cid, name }) {
  db.prepare(`
    INSERT OR IGNORE INTO event_signups (event_id, position_id, cid, name)
    VALUES (?, ?, ?, ?)
  `).run(eventId, positionId, cid, name)
}

export function getSignupsForEvent(eventId) {
  return db.prepare(`
    SELECT event_signups.*, event_positions.name AS position_name
    FROM event_signups
    JOIN event_positions ON event_signups.position_id = event_positions.id
    WHERE event_signups.event_id = ?
    ORDER BY event_signups.signed_up_at ASC
  `).all(eventId)
}

export function approveSignup(id) {
  db.prepare("UPDATE event_signups SET status = 'approved' WHERE id = ?").run(id)
}

export function removeSignup(id) {
  db.prepare('DELETE FROM event_signups WHERE id = ?').run(id)
}



// sops and files 
db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    uploaded_by INTEGER NOT NULL,
    uploaded_by_name TEXT NOT NULL,
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

export function addFile({ title, category, filename, originalName, uploadedBy, uploadedByName }) {
  db.prepare(`
    INSERT INTO files (title, category, filename, original_name, uploaded_by, uploaded_by_name)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, category, filename, originalName, uploadedBy, uploadedByName)
}

export function getAllFiles() {
  return db.prepare('SELECT * FROM files ORDER BY category ASC, title ASC').all()
}

export function getFile(id) {
  return db.prepare('SELECT * FROM files WHERE id = ?').get(id)
}

export function deleteFileRecord(id) {
  db.prepare('DELETE FROM files WHERE id = ?').run(id)
}

export const MEMBER_STATUSES = ['active', 'inactive']

db.exec(`
  CREATE TABLE IF NOT EXISTS member_status (
    cid INTEGER PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'active',
    updated_by INTEGER,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

export function getAllStatuses() {
  const rows = db.prepare('SELECT cid, status FROM member_status').all()
  const result = {}
  for (const row of rows) result[row.cid] = row.status
  return result
}

export function setMemberStatus(cid, status, updatedBy) {
  db.prepare(`
    INSERT INTO member_status (cid, status, updated_by) VALUES (?, ?, ?)
    ON CONFLICT(cid) DO UPDATE SET
      status = excluded.status,
      updated_by = excluded.updated_by,
      updated_at = datetime('now')
  `).run(cid, status, updatedBy)
}
export default db