const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;

const MILLISECONDS_IN_MINUTE = SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND;
const MILLISECONDS_IN_HOUR = MINUTES_IN_HOUR * MILLISECONDS_IN_MINUTE;
const MILLISECONDS_IN_DAY = HOURS_IN_DAY * MILLISECONDS_IN_HOUR;

// From ms

const fromMs = (ms: number, unitDiv: number): number => {
  return Math.floor(ms / unitDiv);
};

export const msToSecs = (ms: number): number => {
  return fromMs(ms, MILLISECONDS_IN_SECOND);
};

export const msToMins = (ms: number): number => {
  return fromMs(ms, MILLISECONDS_IN_MINUTE);
};

export const msToHours = (ms: number): number => {
  return fromMs(ms, MILLISECONDS_IN_HOUR);
};

export const msToDays = (ms: number): number => {
  return fromMs(ms, MILLISECONDS_IN_DAY);
};

// To ms

const toMs = (units: number, unitMul: number): number => {
  return units * unitMul;
};

export const secsToMs = (secs: number): number => {
  return toMs(secs, MILLISECONDS_IN_SECOND);
};

export const minsToMs = (mins: number): number => {
  return toMs(mins, MILLISECONDS_IN_MINUTE);
};

export const hoursToMs = (hours: number): number => {
  return toMs(hours, MILLISECONDS_IN_HOUR);
};

export const daysToMs = (days: number): number => {
  return toMs(days, MILLISECONDS_IN_DAY);
};
