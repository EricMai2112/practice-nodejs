import { S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { config } from 'dotenv'
import { Response } from 'express'
import fs from 'fs'
import path from 'path'
import httpStatus from '~/constants/httpStatus'

config()

const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})
// s3.listBuckets({}).then((data) => {
//   console.log(data)
// })
// const file = fs.readFileSync(path.resolve('uploads/images/bnu3kvh2sd097b7hxw2160hpv.jpg'))

export const uploadFileToS3 = ({
  filename,
  filepath,
  contentType
}: {
  filename: string
  filepath: string
  contentType: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3,
    params: {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: filename,
      Body: fs.readFileSync(filepath),
      ContentType: contentType
    },
    // optional tags
    tags: [
      /*...*/
    ],
    queueSize: 4,
    partSize: 1024 * 1024 * 5,
    leavePartsOnError: false
  })
  return parallelUploads3.done()
}

export const sendFindFromS3 = async (res: Response, filepath: string) => {
  try {
    const data = await s3.getObject({
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: filepath
    })
    ;(data.Body as any).pipe(res)
  } catch (error) {
    res.status(httpStatus.NOT_FOUND).send('Not found')
  }
}

// parallelUploads3.on('httpUploadProgress', (progress) => {
//   console.log(progress)
// })
// parallelUploads3.done().then((res) => console.log(res))
