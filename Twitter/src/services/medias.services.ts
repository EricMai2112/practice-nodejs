import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { getFiles, getNameFromFullName, handleUploadImage, handleUploadVideo } from '~/utils/file'
import path from 'path'
import fs from 'node:fs/promises'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus.schema'
import { uploadFileToS3 } from '~/utils/s3'
import mime from 'mime'
import { rimrafSync } from 'rimraf'
config()

class Queue {
  items: string[]
  encoding: boolean

  constructor() {
    this.items = []
    this.encoding = false
  }

  async enqueue(item: string) {
    this.items.push(item)
    // save into database
    const idName = getNameFromFullName(item.split('/').pop() as string)
    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }

  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true
      const videoPath = this.items[0]
      const idName = getNameFromFullName(videoPath.split('/').pop() as string)
      await databaseService.videoStatus.updateOne(
        { name: idName },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift() //delete the first element
        //upload to S3
        const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR))
        await Promise.all(
          files.map((filepath) => {
            const filename = 'videos-hls' + filepath.replace(path.resolve(UPLOAD_VIDEO_DIR), '')
            return uploadFileToS3({
              filepath,
              filename,
              contentType: mime.getType(filepath) as string
            })
          })
        )
        rimrafSync(path.resolve(UPLOAD_VIDEO_DIR, idName))
        await databaseService.videoStatus.updateOne(
          { name: idName },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        console.error('Encode video success')
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            { name: idName },
            {
              $set: {
                status: EncodingStatus.Failed
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
          .catch((err) => {
            console.error('Update video status failed', err)
          })
        console.error('Encode video error')
        console.log(error)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log('Empty')
    }
  }
}

const queue = new Queue()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        const newFullFileName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFileName)
        const buffer = await fs.readFile(file.filepath)
        await sharp(buffer).jpeg().toFile(newPath)

        const s3Result = await uploadFileToS3({
          filename: 'images/' + newFullFileName,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })

        await Promise.allSettled([fs.unlink(file.filepath), fs.unlink(newPath)])

        return {
          url: s3Result.Location as string,
          type: MediaType.Image
        }

        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/image/${newFullFileName}`
        //     : `http://localhost:${process.env.PORT}/static/image/${newFullFileName}`,
        //   type: MediaType.Image
        // }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    //return object{}
    // const { newFilename } = files[0]
    // return {
    //   url: isProduction
    //     ? `${process.env.HOST}/static/video/${newFilename}`
    //     : `http://localhost:${process.env.PORT}/static/video/${newFilename}`,
    //   type: MediaType.Video
    // }

    //return Array[]
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          filepath: file.filepath,
          contentType: mime.getType(file.filepath) as string
        })
        await fs.unlink(file.filepath)
        return {
          url: s3Result.Location as string,
          type: MediaType.Video
        }
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/video-stream/${file.newFilename}`
        //     : `http://localhost:${process.env.PORT}/static/video-stream/${file.newFilename}`,
        //   type: MediaType.Video
        // }
      })
    )

    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename)
        queue.enqueue(file.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}/master.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )

    return result
  }
  async getVideoStatus(id: string) {
    const data = await databaseService.videoStatus.findOne({ name: id })

    return data
  }
}

const mediasService = new MediasService()
export default mediasService
