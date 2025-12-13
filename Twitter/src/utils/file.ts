import { Request } from 'express'
import { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_DIR, UPLOAD_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_DIR)) {
    fs.mkdirSync(UPLOAD_TEMP_DIR, {
      recursive: true //Mục đích là để tạo folder cha nested
    })
  }
}

export const handleUploadImage = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_TEMP_DIR, // Lưu ảnh ở file uploads, nếu không tạo thì upload thành công nhưng không nhảy vào đâu hết, nên phải kiểm tra và tạo
    maxFiles: 4,
    keepExtensions: true, //Hiện đuôi file mở rộng
    maxFileSize: 400 * 1024, // 300KB / 1 file
    maxTotalFileSize: 400 * 4 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'file' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('File type is invalid') as any)
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
      }
      if (!Boolean(files.file)) {
        return reject(new Error('File is empty'))
      }
      resolve(files.file as File[])
    })
  })
}

export const getNameFromFullName = (fullName: string) => {
  const nameArr = fullName.split('.')
  nameArr.pop()
  return nameArr.join('')
}
