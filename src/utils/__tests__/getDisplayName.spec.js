import expect from 'expect';

import getDisplayName from '../getDisplayName';


describe('utils', () => {
  describe('getDisplayName', () => {
    it('should return String or Component for empty object', () => {
      const actual = [
        { displayName: 'hey' },
        { name: 'ho' },
        {},
      ].map(getDisplayName);
      const expected = ['hey', 'ho', 'Component'];
      expect(actual).toEqual(expected);
    });
  });
});
