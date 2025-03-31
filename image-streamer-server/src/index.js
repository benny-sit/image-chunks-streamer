import 'dotenv/config'
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import { compressImagesFolder } from './image-processing/compressImages.js';
import { INPUT_IMAGE_DIR, NUM_CHUNKS_EACH_TIME, OUTPUT_IMAGE_DIR } from './constants/general.js';
import { splitImage } from './image-processing/splitImage.js';
// import { sliceImage, splitImage } from './image-processing/splitImage.js';


const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: '*'
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  return res.json({ alive: 2007 })
});

io.on('connection', (socket) => {
  console.log('a user connected');

  let streamInterval
  socket.on('start-stream', async (message) => {
    const { prefix, imagePieces } = await splitImage({ filePath: './compressed-images/colors.jpeg', isShuffled: true })
    socket.emit('image-metadata', {prefix, imageId: '#some-id', numberOfChunks: imagePieces.length })

    streamInterval = setInterval(() => {
      for (let i = 0; i < NUM_CHUNKS_EACH_TIME; i++) {
        if (imagePieces.length === 0) {
          clearInterval(streamInterval)
          return
        }
        const part = imagePieces.pop()
        part.left = imagePieces.length
        socket.emit('draw', part)
      }
    }, 100)


  })

  socket.on('disconnect', (reason) => {
    clearInterval(streamInterval)
  })
});

function startServer() {
  // Run Compressions
  compressImagesFolder(INPUT_IMAGE_DIR, OUTPUT_IMAGE_DIR)

  server.listen(process.env.PORT || 3000, () => {
    console.log('server running at ' + process.env.PORT || 3000);
  });
}

startServer()

