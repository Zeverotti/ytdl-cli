const ffmpeg = require('ffmpeg-static');
const cp = require('child_process');

const mergeStreams = (video, audio, outputPath) => {
  const ffmpegProcess = cp.spawn(
    ffmpeg,
    [
      '-i',
      `pipe:3`,
      '-i',
      `pipe:4`,
      '-map',
      '0:v',
      '-map',
      '1:a',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-f',
      'mp4',
      '-loglevel',
      'error',
      outputPath,
    ],
    {
      stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
    }
  );

  video.pipe(ffmpegProcess.stdio[3]);
  audio.pipe(ffmpegProcess.stdio[4]);

  let ffmpegLogs = '';

  ffmpegProcess.stdio[2].on('data', (chunk) => {
    ffmpegLogs += chunk.toString();
  });

  ffmpegProcess.on('exit', (exitCode) => {
    if (exitCode === 1) {
      console.error(ffmpegLogs);
    }
  });

  return ffmpegProcess;
};

module.exports = mergeStreams;
