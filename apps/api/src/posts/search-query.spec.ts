import { toBooleanSearch } from './search-query';

describe('toBooleanSearch', () => {
  it('requires every term and matches by prefix', () => {
    expect(toBooleanSearch('dobrar meta')).toBe('+dobrar* +meta*');
  });

  it('strips boolean operators typed by the user', () => {
    expect(toBooleanSearch('+react -"vue" (angular)* ~svelte')).toBe(
      '+react* +vue* +angular* +svelte*',
    );
  });

  it('keeps accented letters', () => {
    expect(toBooleanSearch('mandioca saudação')).toBe('+mandioca* +saudação*');
  });

  it('drops terms shorter than the index minimum and returns null if none are left', () => {
    expect(toBooleanSearch('de a')).toBeNull();
    expect(toBooleanSearch('   ')).toBeNull();
    expect(toBooleanSearch('de react')).toBe('+react*');
  });
});
