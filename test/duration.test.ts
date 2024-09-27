import { Duration, Instant } from '../src';

test('Creates duration from data', async () => {
  const duration = new Duration({ milliseconds: 6_121_041 });
  expect(duration.data.milliseconds).toBe(6_121_041);
  expect(duration.milliseconds).toBe(6_121_041);
});

test('Creates same duration from any unit', async () => {
  expect(Duration.fromMilliseconds(200_000_000).milliseconds).toBe(200_000_000);
  expect(Duration.fromSeconds(195_000).milliseconds).toBe(195_000_000);
  expect(Duration.fromMinutes(3200).milliseconds).toBe(192_000_000);
  expect(Duration.fromHours(52).milliseconds).toBe(187_200_000);
  expect(Duration.fromDays(2).milliseconds).toBe(172_800_000);
});

test('Converts duration to any unit', async () => {
  const duration = Duration.fromMilliseconds(92_521_041);
  expect(duration.milliseconds).toBe(92_521_041);
  expect(duration.seconds).toBe(92_521);
  expect(duration.minutes).toBe(1542);
  expect(duration.hours).toBe(25);
  expect(duration.days).toBe(1);
});

test('Creates duration between two instants', async () => {
  const beforeInstant = new Instant({ atMilliseconds: 1_234_567 });
  const afterInstant = new Instant({ atMilliseconds: 7_355_608 });
  const duration = afterInstant.durationSince(beforeInstant);
  expect(duration.milliseconds).toBe(6_121_041);
});

test('Performs addition on two durations', async () => {
  const leftDuration = Duration.fromMilliseconds(7_355_608);
  const rightDuration = Duration.fromMilliseconds(1_234_567);
  expect(leftDuration.add(rightDuration).is('equal', Duration.fromMilliseconds(8_590_175)));
});

test('Performs subtraction on two durations', async () => {
  const leftDuration = Duration.fromMilliseconds(7_355_608);
  const rightDuration = Duration.fromMilliseconds(1_234_567);
  expect(leftDuration.sub(rightDuration).is('equal', Duration.fromMilliseconds(6_121_041)));
});

export default {};
