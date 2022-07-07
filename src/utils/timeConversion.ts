const _stripDecimals = (input: string) => {
  return parseInt(input.split('.')[1]);
};

/**
 * Converts HH:MM:SS.ms to numeric values (seconds, milliseconds)
 * @param input
 * @returns
 */
const hmsToNumeric = (input: string) => {
  const p = input.split(':');
  let s = 0;
  let m = 1;

  // check if milliseconds are present
  if (p[p.length - 1].split('.').length > 1) {
    s = _stripDecimals(p[p.length - 1]) / 1000;
  }

  while (p.length > 0) {
    s += m * parseInt(p.pop() || '0', 10);
    m *= 60;
  }

  const seconds = s;
  const milliseconds = seconds * 1000;
  const minutes = seconds / 60;

  return {
    minutes,
    seconds,
    milliseconds,
  };
};

/**
 * Converts seconds to HH:MM:SS.ms
 * @param input
 */
const numericToHms = (seconds: number) => {
  let result = new Date(seconds * 1000).toISOString().slice(11, 19);

  if (seconds % 1 != 0) {
    result += `.${_stripDecimals(seconds.toString())}`;
  }

  return result;
};

export { hmsToNumeric, numericToHms };
