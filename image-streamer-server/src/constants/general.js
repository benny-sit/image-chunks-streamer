export const IMAGE_SIZE = 720
export const NUM_COLS = 60

export const NUM_CHUNKS_EACH_TIME = 10
export const NUM_OF_CHUNKS = NUM_COLS * NUM_COLS

export const NUM_OF_STREAMS = NUM_OF_CHUNKS / NUM_CHUNKS_EACH_TIME
export const STREAM_MINIMAL_LENGTH_MS = 10_000
export const STREAM_WAIT_INTERVAL_MS = STREAM_MINIMAL_LENGTH_MS / NUM_OF_STREAMS

export const CHUNK_SIZE = IMAGE_SIZE / NUM_COLS

export const INPUT_IMAGE_DIR = './images'
export const OUTPUT_IMAGE_DIR = './compressed-images'