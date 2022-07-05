import parseFfmpegOutput from './parseFfmpegOutput';
import cp from 'child_process';
import ffmpeg from 'ffmpeg-static';
import { ffmpegProgressOutput } from './parseFfmpegOutput';
import { Readable } from 'stream';

type progressFunc = (progress: typeof ffmpegProgressOutput) => void;

const mergeStreams = (
  video: Readable,
  audio: Readable,
  outputPath: string,
  progress: progressFunc
) => {
  const ffmpegProcess: any = cp.spawn(
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
      'warning',
      outputPath,
      '-progress',
      'pipe:2',
      '-y',
    ],
    {
      stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
    }
  );

  video.pipe(ffmpegProcess.stdio[3]);
  audio.pipe(ffmpegProcess.stdio[4]);

  let ffmpegLogs = '';

  ffmpegProcess.stdio[2].on('data', (chunk: any) => {
    ffmpegLogs += chunk.toString();
    progress(parseFfmpegOutput(chunk.toString()));
  });

  ffmpegProcess.on('exit', (exitCode: number | null) => {
    if (exitCode === 1) {
      console.error(ffmpegLogs);
    }
  });

  return ffmpegProcess;
};

export default mergeStreams;
