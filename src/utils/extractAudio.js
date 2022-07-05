const ffmpeg = require('ffmpeg-static');
const cp = require('child_process');
const parseFfmpegOutput = require('./parseFfmpegOutput');

const extractAudio = (input, outputPath, progress) => {
  const ffmpegProcess = cp.spawn(
    ffmpeg,
    [
      '-i',
      `pipe:3`,
      '-q:a',
      '0',
      '-map',
      'a',
      '-f',
      'mp3',
      '-loglevel',
      'warning',
      outputPath,
      '-progress',
      'pipe:2',
      '-y',
    ],
    {
      stdio: ['pipe', 'pipe', 'pipe', 'pipe'],
    }
  );

  input.pipe(ffmpegProcess.stdio[3]);

  let ffmpegLogs = '';

  ffmpegProcess.stdio[2].on('data', (chunk) => {
    ffmpegLogs += chunk.toString();
    progress(parseFfmpegOutput(chunk.toString()));
  });

  ffmpegProcess.on('exit', (exitCode) => {
    if (exitCode === 1) {
      console.error(ffmpegLogs);
    }
  });

  return ffmpegProcess;
};

module.exports = extractAudio;
