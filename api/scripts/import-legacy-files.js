// Copies the documents published on the old ZAN site into uploads/ and the files table.
// Run from the api root (/app in the pod): node scripts/import-legacy-files.js
// Safe to re-run: a file already imported is skipped. Stops at the first failure, and a
// file is written before its row, so a failed run can simply be run again.
import fs from 'fs'
import path from 'path'
import db, { addFile } from '../db.js'

const BASE = 'https://cdn.zanartcc.org/uploads'
const FILES = [
  { id: 3, title: 'ARTCCCAM 7210.1C - ARTCC Administrative Manual', category: 'Policies', name: '3-artcccam-72101b--artcc-administrative-manual.pdf' },
  { id: 17, title: 'CZEG - Edmonton FIR', category: 'LOAs', name: '17-czeg--edmonton-fir.pdf' },
  { id: 31, title: 'CZVR - Vancouver FIR', category: 'LOAs', name: '31-czvr--vancouver-fir.pdf' },
  { id: 30, title: 'KZAK - Oakland ARTCC', category: 'LOAs', name: '30-kzak--oakland-artcc.pdf' },
  { id: 12, title: 'All-in-One vATIS 4.0.0-beta7 pack', category: 'Resources', name: '12-all-in-one-vatis-400-beta7-pack.zip' },
  { id: 16, title: 'ATOP Non-Radar Guide', category: 'Training', name: '16-atops-non-radar-guide.pdf' },
  { id: 29, title: 'ATOP Plugin Guide', category: 'Training', name: '29-atop-plugin-guide.pdf' },
]

const exists = db.prepare('SELECT 1 FROM files WHERE filename = ?')

for (const file of FILES) {
  const filename = `legacy-${file.id}${path.extname(file.name)}`
  if (exists.get(filename)) {
    console.log(`skip ${file.title}: already imported`)
    continue
  }

  const response = await fetch(`${BASE}/${file.name}`)
  if (!response.ok) throw new Error(`${file.name}: HTTP ${response.status}`)
  const body = Buffer.from(await response.arrayBuffer())

  fs.writeFileSync(path.join('uploads', filename), body)
  addFile({
    title: file.title,
    category: file.category,
    filename,
    originalName: file.name,
    uploadedBy: 0,
    uploadedByName: 'Legacy site import',
  })
  console.log(`imported ${file.title}: ${body.length} bytes, ${file.category}`)
}
