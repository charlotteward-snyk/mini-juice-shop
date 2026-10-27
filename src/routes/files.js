const router = require('express').Router()
const multer = require('multer')
const fileUpload = require('express-fileupload')
const AdmZip = require('adm-zip')
const tar = require('tar')
const path = require('path')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 } })

router.post('/file-upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file required' })
  res.json({ name: req.file.originalname, size: req.file.size })
})

router.post('/profile/image-upload', fileUpload({ limits: { fileSize: 1024 * 1024 } }), (req, res) => {
  const file = req.files && req.files.file
  if (!file) return res.status(400).json({ error: 'file required' })
  res.json({ name: file.name, size: file.size, mimetype: file.mimetype })
})

router.post('/rest/backup/inspect', fileUpload(), (req, res) => {
  const archive = req.files && req.files.archive
  if (!archive) return res.status(400).json({ error: 'archive required' })
  const entries = new AdmZip(archive.data).getEntries().map((e) => e.entryName)
  res.json({ entries })
})

router.get('/ftp/backup.tgz', (req, res) => {
  res.type('application/gzip')
  tar.c({ gzip: true, cwd: path.join(__dirname, '..') }, ['data.js']).pipe(res)
})

module.exports = router
