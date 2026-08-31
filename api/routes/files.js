import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { addFile, getAllFiles, getFile, deleteFileRecord } from '../db.js'
import { requireRole } from '../middleware/auth.js'

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

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB cap
})

// Public - list all files
router.get('/', (req, res) => {
  res.json(getAllFiles())
})

// Public - download a specific file
router.get('/:id/download', (req, res) => {
  const file = getFile(req.params.id)
  if (!file) return res.status(404).json({ error: 'File not found' })

  const filePath = path.join(process.cwd(), 'uploads', file.filename)

  if (file.original_name.toLowerCase().endsWith('.pdf')) {
    // Open PDFs inline in the browser instead of forcing a download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`)
    res.sendFile(filePath)
  } else {
    res.download(filePath, file.original_name)
  }
})

// Senior staff only (TA+) - upload a file
router.post('/', requireRole('TA'), upload.single('file'), (req, res) => {
  const { title, category } = req.body

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  if (!title || !category) {
    // clean up the file we just saved, since we're rejecting this upload
    fs.unlinkSync(req.file.path)
    return res.status(400).json({ error: 'Missing title or category' })
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