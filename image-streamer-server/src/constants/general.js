export const IMAGE_SIZE = 720
export const NUM_COLS = 60

export const NUM_CHUNKS_EACH_TIME = 10

export const NUM_OF_STREAMS = NUM_COLS * NUM_COLS / NUM_CHUNKS_EACH_TIME

export const CHUNK_SIZE = IMAGE_SIZE / NUM_COLS

export const INPUT_IMAGE_DIR = './images'
export const OUTPUT_IMAGE_DIR = './compressed-images'