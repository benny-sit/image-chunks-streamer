
import fs from 'fs'
import { glob, globSync } from 'glob';

import path from 'path'
import sharp from 'sharp'

import {IMAGE_SIZE} from '../constants/general.js'

export function compressImagesFolder(inputFolderPath = '/', outputFolderPath) {
  outputFolderPath = outputFolderPath || path.join(inputFolderPath, 'min')
  const inputFolderGlob = path.join(inputFolderPath, '**', '*.{jpeg,jpg}').replaceAll('\\', '/')
  const outputFolderGlob = path.join(outputFolderPath, '**', '*.{jpeg,jpg}').replaceAll('\\', '/')

  let images = glob.sync(inputFolderGlob, { posix: true, dotRelative: true })
  const existingImagesNames = glob.sync(outputFolderGlob, { posix: true, dotRelative: true }).map(img => path.basename(img, path.extname(img)))
  images = images.filter(img => !existingImagesNames.includes(path.basename(img, path.extname(img))))

  fs.mkdirSync(outputFolderPath, { recursive: true });
  images.forEach(function (inputFile) {
    sharp(inputFile)
      .resize({ width: IMAGE_SIZE })
      .jpeg({ mozjpeg: true, quality: 50, force: true })
      .toFile(path.join(outputFolderPath, path.basename(inputFile, path.extname(inputFile)) + '.jpeg'), (err, info) => {
        if (err === null) {
          console.log("Successfully compressed -", path.basename(inputFile))
        } else { throw err }
      });
  });

}