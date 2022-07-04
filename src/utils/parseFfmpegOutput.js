const parseFfmpegOutput = (input) => {
  const lines = input.split('\n');
  let obj = {};

  for (const line of lines) {
    const parsed = line.split('=');
    const key = parsed[0];
    const value = parsed[1];
    obj[key] = value;
  }

  return obj;
};

module.exports = parseFfmpegOutput;
