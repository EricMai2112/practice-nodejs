import { NextFunction, Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.resolve('uploads'), // Lưu ảnh ở file uploads, nếu không tạo thì upload thành công nhưng không nhảy vào đâu hết, nên phải kiểm tra và tạo
    maxFiles: 1,
    keepExtensions: true, //Hiện đuôi file mở rộng
    maxFileSize: 300 * 1024 // 300KB / 1 file
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }

    return res.json({
      message: 'Upload image successfully'
    })
  })
}
