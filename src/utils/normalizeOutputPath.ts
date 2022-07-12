import fs from 'fs';
import { videoInfo } from 'ytdl-core';
import path from 'path';

const normalizeOutputPath = (
  query: any,
  output: string,
  videoInfo: videoInfo
) => {
  let normalizedPath = output;
  if (!path.isAbsolute(normalizedPath))
    normalizedPath = path.join(process.cwd(), normalizedPath);
  const exists = fs.existsSync(normalizedPath);
  if (!exists) return normalizedPath;
  const isDirectory = fs.lstatSync(normalizedPath).isDirectory();
  if (isDirectory) {
    normalizedPath = path.join(normalizedPath, videoInfo.videoDetails.title);
  }
  if (query.thumbnail) normalizedPath += '.jpg';
  else if (query.mp3) normalizedPath += '.mp3';
  else normalizedPath += '.mp4';

  return normalizedPath;
};

export default normalizeOutputPath;
