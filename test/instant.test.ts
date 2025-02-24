import { Instant } from '../src';

test('Creates instant from data', async () => {
  const instant = new Instant({ atMilliseconds: 7_355_608 });
  expect(instant.data.atMilliseconds).toBe(7_355_608);
});

test('Creates instant representing now', async () => {
  const millisecondsBefore = new Date().getTime();
  const instant = Instant.now();
  const millisecondsAfter = new Date().getTime();
  expect(instant.data.atMilliseconds).toBeGreaterThanOrEqual(millisecondsBefore);
  expect(instant.data.atMilliseconds).toBeLessThanOrEqual(millisecondsAfter);
});

export default {};
