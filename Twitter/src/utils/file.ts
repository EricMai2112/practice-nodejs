import { Request } from 'express'
import fs from 'fs'
import path from 'path'

export const initFolder = () => {
  const uploadFolderPath = path.resolve('uploads')
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true //Mục đích là để tạo folder cha nested
    })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('uploads'), // Lưu ảnh ở file uploads, nếu không tạo thì upload thành công nhưng không nhảy vào đâu hết, nên phải kiểm tra và tạo
    maxFiles: 1,
    keepExtensions: true, //Hiện đuôi file mở rộng
    maxFileSize: 3000 * 1024, // 3000KB / 1 file
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'file' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is invalid') as any)
      }
      return valid
    }
  })

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      if (!Boolean(files.file)) {
        return reject(new Error('File is empty'))
      }
      resolve(files)
    })
  })
}
