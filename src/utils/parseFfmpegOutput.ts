const ffmpegProgressOutput = {
  frame: '',
  fps: '',
  bitrate: '',
  total_size: '',
  out_time_us: '',
  out_time_ms: '',
  out_time: '',
  dup_frames: '',
  drop_frames: '',
  speed: '',
  progress: '',
};

const parseFfmpegOutput = (input: string): typeof ffmpegProgressOutput => {
  const lines = input.split('\n');
  let obj = { ...ffmpegProgressOutput };

  for (const line of lines) {
    const parsed = line.split('=');
    const key = parsed[0];
    const value = parsed[1];
    obj[key as keyof typeof ffmpegProgressOutput] = value;
  }

  return obj;
};

export default parseFfmpegOutput;
export { ffmpegProgressOutput };
