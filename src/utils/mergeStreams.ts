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
  progress: progressFunc,
  begin?: string,
  end?: string
) => {
  const ffmpegProcess: any = cp.spawn(
    ffmpeg,
    [
      '-i',
      `pipe:3`,
      '-f',
      'mp4',
      '-i',
      `pipe:4`,
      '-map',
      '0:v',
      '-map',
      '1:a',
      ...(begin || end ? [] : ['-c:v', 'copy']),
      '-c:a',
      'aac',
      ...(begin ? ['-ss', begin] : []),
      ...(end ? ['-to', end] : []),
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

  const streamErrorHandler = (err: any) => {
    // Stream was closed because ffmpeg achieved the target duration,
    // will not raise any error because it's intended behavior.
    // Not 100% secure since one of the pipes might close for another
    // reason and will pass this check.
    if (
      true &&
      (ffmpegProcess.stdio[3].closed || ffmpegProcess.stdio[4].closed)
    )
      return;

    console.log('Error occured during encoding');
  };

  video.pipe(ffmpegProcess.stdio[3]).on('error', streamErrorHandler);
  audio.pipe(ffmpegProcess.stdio[4]).on('error', streamErrorHandler);

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
