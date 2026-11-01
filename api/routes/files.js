import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import contentDisposition from 'content-disposition'
import { addFile, getAllFiles, getFile, deleteFileRecord } from '../db.js'
import { requireRole } from '../middleware/auth.js'
import { isKnownCategory, canSeeCategory } from '../utils/files.js'

const router = express.Router()

// multer saves the uploaded file to disk with a unique name, so two people
// uploading "chapter1.pdf" never overwrite each other
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

// Both the extension and the browser-reported mimetype have to match one of these - neither
// alone is trustworthy (a client can rename a file or lie about its Content-Type), but
// together they at least rule out someone uploading, say, an .html or .svg file that would
// later be served back from this same origin.
const ALLOWED_TYPES = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Browsers disagree on the zip mimetype (Windows commonly reports the x- form). Zips are
  // never served inline: the download route only uses inline for PDFs.
  '.zip': ['application/zip', 'application/x-zip-compressed'],
}

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB cap
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (![].concat(ALLOWED_TYPES[ext]).includes(file.mimetype)) {
      req.fileRejected = true
      return cb(null, false)
    }
    cb(null, true)
  },
})

// List files - Admin Policies rows are dropped for anyone below TA
router.get('/', (req, res) => {
  const files = getAllFiles().filter((f) => canSeeCategory(req.user?.zanRole, f.category))
  res.json(files)
})

// Download a specific file - same category check as the list, so a category can't be
// found by other means (a shared link, a stale bookmark) and downloaded directly
router.get('/:id/download', (req, res) => {
  const file = getFile(req.params.id)
  if (!file) return res.status(404).json({ error: 'File not found' })
  if (!canSeeCategory(req.user?.zanRole, file.category)) {
    return res.status(403).json({ error: 'Not authorized' })
  }

  const filePath = path.join(process.cwd(), 'uploads', file.filename)

  if (file.original_name.toLowerCase().endsWith('.pdf')) {
    // Open PDFs inline in the browser instead of forcing a download. Building this header
    // by hand (`inline; filename="${file.original_name}"`) let a crafted original_name break
    // out of the quoted string or, worse, include a raw newline - Node's setHeader() throws
    // on \r/\n so that particular case would just 500, but a stray `"` could still corrupt
    // the header. content-disposition (the same package res.download() uses internally)
    // handles the escaping correctly.
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', contentDisposition(file.original_name, { type: 'inline' }))
    res.sendFile(filePath)
  } else {
    res.download(filePath, file.original_name)
  }
})

// Senior staff only (TA+) - upload a file
router.post('/', requireRole('TA'), upload.single('file'), (req, res) => {
  const { title, category } = req.body

  if (req.fileRejected) {
    return res.status(400).json({ error: 'File type not allowed (pdf, png, jpg, docx, xlsx, zip only)' })
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  if (!title || !isKnownCategory(category)) {
    // clean up the file we just saved, since we're rejecting this upload. Validating the
    // category here matters, not just on read - an off-list category (e.g. a typo'd
    // "admin policies") would otherwise slip past the exact-match check in canSeeCategory.
    fs.unlinkSync(req.file.path)
    return res.status(400).json({ error: 'Missing title or unknown category' })
  }

  addFile({
    title,
    category,
    filename: req.file.filename,
    originalName: req.file.originalname,
    uploadedBy: req.user.cid,
    uploadedByName: req.user.name,
  })

  res.json({ success: true })
})

// Senior staff only (TA+) - delete a file
router.delete('/:id', requireRole('TA'), (req, res) => {
  const file = getFile(req.params.id)
  if (!file) return res.status(404).json({ error: 'File not found' })

  const filePath = path.join(process.cwd(), 'uploads', file.filename)
  fs.unlink(filePath, (err) => {
    if (err) console.error('Could not delete file from disk:', err)
  })

  deleteFileRecord(req.params.id)
  res.json({ success: true })
})

export default router