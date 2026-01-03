import { NextFunction, Request, Response } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import path from 'path'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import httpStatus from '~/constants/httpStatus'
import fs from 'fs'
import mime from 'mime'
import { sendFindFromS3 } from '~/utils/s3'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadImage(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESSFULLY,
    result: url
  })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideo(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESSFULLY,
    result: url
  })
}

export const uploadVideoHLSController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.uploadVideoHLS(req)

  return res.json({
    message: USERS_MESSAGES.UPLOAD_SUCCESSFULLY,
    result: url
  })
}

export const videoStatusController = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  const result = await mediasService.getVideoStatus(id as string)

  return res.json({
    message: USERS_MESSAGES.GET_VIDEO_STATUS_SUCCESS,
    result: result
  })
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params

  return res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}

export const serveM3u8Controller = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params
  sendFindFromS3(res, `videos-hls/${id}/master.m3u8`)
  // return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, 'master.m3u8'), (err) => {
  //   if (err) {
  //     res.status((err as any).status).send('Not found')
  //   }
  // })
}

export const serveSegmentController = (req: Request, res: Response, next: NextFunction) => {
  const { id, v, segment } = req.params

  sendFindFromS3(res, `videos-hls/${id}/${v}/${segment}`)

  // return res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, id, v, segment), (err) => {
  //   if (err) {
  //     res.status((err as any).status).send('Not found')
  //   }
  // })
}

export const serveVideoStreamController = (req: Request, res: Response, next: NextFunction) => {
  const { range } = req.headers
  if (!range) {
    return res.status(httpStatus.BAD_REQUEST).send('Requires Range Headers')
  }
  const { name } = req.params
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)

  //Dung lượng video tính bằng Bytes
  const videoSize = fs.statSync(videoPath).size
  //Dung lượng video cho mỗi phân đoạn stream
  const chunkSize = 10 ** 6 //1MB
  //Lấy giá trị byte bắt đầu từ header range
  const start = Number(range.replace(/\D/g, ''))
  //Lấy giá trị byte kết thúc từ header range, vượt quá dung lượng video thì lấy giá trị videoSize
  const end = Math.min(start + chunkSize, videoSize - 1)

  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(httpStatus.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}
