import path from 'path';
import { exec, ExecException } from 'child_process';
import fs from 'fs';
import pathToFfmpeg from 'ffmpeg-static';
import { hmsToNumeric } from '../src/utils/timeConversion';
import ytdl from 'ytdl-core';

const VIDEO_URLS = [
  'https://youtu.be/d1VR2MMUVO0',
  'https://youtu.be/YXT9CQ16-i8',
];
const OUTPUT_FOLDER = './testfiles';
const LENGTH_TOLERANCE = 5;

interface res {
  code: number;
  error: ExecException | null;
  stdout: string;
  stderr: string;
}

function cli(args: string[], cwd: string, errorLogging = false): Promise<res> {
  return new Promise((resolve) => {
    exec(
      `node ${path.resolve('./build/index.js')} ${args.join(' ')}`,
      { cwd },
      (error, stdout, stderr) => {
        if (errorLogging && error && error.code) {
          console.log('Error', error, stdout, stderr);
        }
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr,
        });
      }
    );
  });
}

const getDuration = (path: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    exec(`${pathToFfmpeg} -i '${path}'`, (error, stdout, stderr) => {
      const str = stdout || stderr;
      const pos = str.search('Duration:');
      let end = pos;
      let loop = true;
      let i = pos;
      while (loop) {
        if (str[i] === ',') loop = false;
        end = i;
        i += 1;
      }
      let extractedString = str.substring(pos, end);
      extractedString = extractedString.replace('Duration: ', '').trim();
      resolve(hmsToNumeric(extractedString).seconds);
    });
  });
};

const isBetween = (x: number, min: number, max: number) => {
  return x >= min && x <= max;
};

beforeAll(() => {
  return fs.mkdirSync(OUTPUT_FOLDER);
});

describe('Test cli', () => {
  test('Test mp4 download', async () => {
    let result = await cli(
      ['-l', VIDEO_URLS[0], '-o', OUTPUT_FOLDER],
      '.',
      true
    );
    const { videoDetails } = await ytdl.getBasicInfo(VIDEO_URLS[0]);
    const duration = await getDuration(
      `${OUTPUT_FOLDER}/${videoDetails.title}.mp4`
    );
    const ytDuration = parseInt(videoDetails.lengthSeconds);
    const durationRes = isBetween(
      duration,
      ytDuration - LENGTH_TOLERANCE,
      ytDuration + LENGTH_TOLERANCE
    );
    expect(result.code).toBe(0);
    expect(durationRes).toBe(true);
  });
  test('Test mp3 download', async () => {
    let result = await cli(
      ['-l', VIDEO_URLS[0], '--mp3', '-o', OUTPUT_FOLDER],
      '.',
      true
    );
    const { videoDetails } = await ytdl.getBasicInfo(VIDEO_URLS[0]);
    const duration = await getDuration(
      `${OUTPUT_FOLDER}/${videoDetails.title}.mp3`
    );
    const ytDuration = parseInt(videoDetails.lengthSeconds);
    const durationRes = isBetween(
      duration,
      ytDuration - LENGTH_TOLERANCE,
      ytDuration + LENGTH_TOLERANCE
    );
    expect(result.code).toBe(0);
    expect(durationRes).toBe(true);
  });
  test('Test thumbnail download', async () => {
    let result = await cli(
      ['-l', VIDEO_URLS[0], '--thumbnail', '-o', OUTPUT_FOLDER],
      '.',
      true
    );
    expect(result.code).toBe(0);
  });
  test('Test input file', async () => {
    const videosFile = path.join(OUTPUT_FOLDER, 'videos.txt');
    const fileContent = VIDEO_URLS.map(
      (e, i) => `${e} -o ${path.join(OUTPUT_FOLDER, `${i}.mp4`)}`
    ).join('\n');
    fs.writeFileSync(videosFile, fileContent);
    const result = await cli(['-l', videosFile], '.', true);
    expect(result.code).toBe(0);
    const existsResult = VIDEO_URLS.map((e, i) =>
      fs.existsSync(path.join(OUTPUT_FOLDER, `${i}.mp4`))
    );
    expect(existsResult.filter((e) => !e).length).toBe(0);
  });
});

afterAll(() => {
  return fs.rmSync(OUTPUT_FOLDER, { recursive: true });
});

jest.setTimeout(20000);
