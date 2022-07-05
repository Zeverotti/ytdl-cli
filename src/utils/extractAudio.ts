import ffmpeg from 'ffmpeg-static';
import cp from 'child_process';
import parseFfmpegOutput from './parseFfmpegOutput';
import { Readable } from 'stream';
import { ffmpegProgressOutput } from './parseFfmpegOutput';

type progressFunc = (progress: typeof ffmpegProgressOutput) => void;

const extractAudio = (
  input: Readable,
  outputPath: string,
  progress: progressFunc
) => {
  const ffmpegProcess: any = cp.spawn(
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

  ffmpegProcess.stdio[2].on('data', (chunk: any) => {
    ffmpegLogs += chunk.toString();
    progress(parseFfmpegOutput(chunk.toString()));
  });

  ffmpegProcess.on('exit', (exitCode: string | null) => {
    if (exitCode === '1') {
      console.error(ffmpegLogs);
    }
  });

  return ffmpegProcess;
};

export default extractAudio;
