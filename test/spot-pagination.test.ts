import { describe, test, expect } from 'vitest';
import { paginateAccounts } from '../src/tools/spot.js';
import type { SpotAccount } from 'gate-api';

function makeAccount(currency: string, available: string, locked: string): SpotAccount {
  return { currency, available, locked, updateId: 1 } as SpotAccount;
}

describe('paginateAccounts', () => {
  describe('AC-HP-01: default pagination', () => {
    test('returns first page with default limit', () => {
      const accounts: SpotAccount[] = [];
      for (let i = 1; i <= 20; i++) {
        accounts.push(makeAccount(`COIN${i}`, `${i}.0`, '0'));
      }

      const result = paginateAccounts(accounts, 1, 10);

      expect(result.accounts).toHaveLength(10);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 20,
        total_pages: 2,
      });
    });
  });

  describe('AC-HP-02: custom page', () => {
    test('returns correct page with custom page and limit', () => {
      const accounts: SpotAccount[] = [];
      for (let i = 1; i <= 12; i++) {
        accounts.push(makeAccount(`COIN${i}`, `${i}.0`, '0'));
      }

      const result = paginateAccounts(accounts, 2, 5);

      expect(result.accounts).toHaveLength(5);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 12,
        total_pages: 3,
      });
    });
  });

  describe('AC-BD-01: page overflow', () => {
    test('returns empty array when page exceeds range', () => {
      const accounts: SpotAccount[] = [];
      for (let i = 1; i <= 15; i++) {
        accounts.push(makeAccount(`COIN${i}`, `${i}.0`, '0'));
      }

      const result = paginateAccounts(accounts, 3, 10);

      expect(result.accounts).toHaveLength(0);
      expect(result.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 15,
        total_pages: 2,
      });
    });
  });

  describe('AC-BD-02: limit cap', () => {
    test('caps limit to 1000 when exceeding', () => {
      const accounts: SpotAccount[] = [];
      for (let i = 1; i <= 5; i++) {
        accounts.push(makeAccount(`COIN${i}`, `${i}.0`, '0'));
      }

      const result = paginateAccounts(accounts, 1, 2000);

      expect(result.pagination.limit).toBe(1000);
    });
  });

  describe('edge cases', () => {
    test('handles empty accounts array', () => {
      const result = paginateAccounts([], 1, 10);

      expect(result.accounts).toHaveLength(0);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0,
      });
    });

    test('defaults page to 1 when <= 0', () => {
      const accounts = [makeAccount('BTC', '1.0', '0')];
      const result = paginateAccounts(accounts, 0, 10);

      expect(result.pagination.page).toBe(1);
      expect(result.accounts).toHaveLength(1);
    });

    test('clamps limit to 1 when <= 0', () => {
      const accounts = [makeAccount('BTC', '1.0', '0')];
      const result = paginateAccounts(accounts, 1, -5);

      expect(result.pagination.limit).toBe(1);
    });
  });
});
