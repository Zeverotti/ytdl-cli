import path from 'path';
import { exec, ExecException } from 'child_process';
import fs from 'fs';

const VIDEO_URL = 'https://youtu.be/d1VR2MMUVO0';
const OUTPUT_FOLDER = './testfiles';

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

beforeAll(() => {
  return fs.mkdirSync(OUTPUT_FOLDER);
});

describe('Test cli', () => {
  test('Test mp4 download', async () => {
    let result = await cli(['-l', VIDEO_URL, '-o', OUTPUT_FOLDER], '.', true);
    expect(result.code).toBe(0);
  });
  test('Test mp3 download', async () => {
    let result = await cli(
      ['-l', VIDEO_URL, '--mp3', '-o', OUTPUT_FOLDER],
      '.',
      true
    );
    expect(result.code).toBe(0);
  });
  test('Test thumbnail download', async () => {
    let result = await cli(
      ['-l', VIDEO_URL, '--thumbnail', '-o', OUTPUT_FOLDER],
      '.',
      true
    );
    expect(result.code).toBe(0);
  });
});

afterAll(() => {
  return fs.rmSync(OUTPUT_FOLDER, { recursive: true });
});

jest.setTimeout(20000);
