import { INITIAL_LOCATIONS } from './utils/db';

test('includes seeded locations for the explore experience', () => {
  expect(INITIAL_LOCATIONS.length).toBeGreaterThan(0);
  expect(INITIAL_LOCATIONS).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: 'loc_savandurga', name: 'Savandurga Monolith Trek' })
    ])
  );
});
