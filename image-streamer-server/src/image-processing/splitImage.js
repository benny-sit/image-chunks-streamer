
import { createCanvas, loadImage } from "canvas";
import { CHUNK_SIZE, NUM_COLS } from "../constants/general.js";
import fs from 'fs'
import { longestCommonPrefix, shuffleArr } from "../utils/general.js";
// import { Jimp } from "jimp";


function canvasBlob(dataURL) {
  var data = atob(dataURL.substring("data:image/jpeg;base64,".length)), // also change format
    asArray = new Uint8Array(data.length);

  for (var i = 0, len = data.length; i < len; ++i) {
    asArray[i] = data.charCodeAt(i);
  }

  const blob = new Blob([asArray.buffer], { type: "image/jpeg" }); // also change format
  return blob
}

export async function splitImage({ filePath, isShuffled = false }) {
  const image = await loadImage(filePath)

  let imagePiecesTemp = [];
  for (let x = 0; x < NUM_COLS; ++x) {
    for (let y = 0; y < NUM_COLS; ++y) {
      const canvas = createCanvas(CHUNK_SIZE, CHUNK_SIZE)
      const context = canvas.getContext('2d');
      context.drawImage(image, x * CHUNK_SIZE, y * CHUNK_SIZE, CHUNK_SIZE, CHUNK_SIZE, 0, 0, canvas.width, canvas.height);
      // imagePiecesTemp.push({ x: x * CHUNK_SIZE, y: y * CHUNK_SIZE, data: canvas.toDataURL() });
      imagePiecesTemp.push(canvas.toDataURL());
    }
  }

  const imagesPrefix = longestCommonPrefix(imagePiecesTemp)

  const imagePieces = []
  for (let x = 0; x < NUM_COLS; ++x) {
    for (let y = 0; y < NUM_COLS; ++y) {
      const piece = imagePiecesTemp[x * NUM_COLS + y]
      imagePieces.push({ x: x * CHUNK_SIZE, y: y * CHUNK_SIZE, data: piece.slice(imagesPrefix.length) })
    }
  }

  if (isShuffled) {
    shuffleArr(imagePieces)
  }

  return { prefix: imagesPrefix, imagePieces }
}