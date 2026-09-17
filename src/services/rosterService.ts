/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trainee } from '../types';
import { ROSTER as DEFAULT_ROSTER } from '../data/roster';

const STORAGE_KEY_ROSTER = 'fin_lit_roster_v2';

export const rosterService = {
  getRoster(): Trainee[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROSTER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load custom roster:', e);
    }
    return DEFAULT_ROSTER;
  },

  saveRoster(roster: Trainee[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ROSTER, JSON.stringify(roster));
    } catch (e) {
      console.error('Failed to save roster:', e);
    }
  },

  addTrainee(trainee: Trainee): boolean {
    const list = this.getRoster();
    // Check if ID already exists
    const existingIndex = list.findIndex(t => t.id === trainee.id);
    if (existingIndex >= 0) {
      // update name
      list[existingIndex] = trainee;
    } else {
      list.push(trainee);
    }
    this.saveRoster(list);
    return true;
  },

  removeTrainee(id: string): void {
    const list = this.getRoster().filter(t => t.id !== id);
    this.saveRoster(list);
  },

  importBulkNames(text: string): { count: number } {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const currentList = this.getRoster();
    const existingIds = new Set(currentList.map(t => t.id));
    let nextIdNum = 1000 + currentList.length + 1;
    let addedCount = 0;

    for (const line of lines) {
      // format can be: "Name" OR "Name - 1026" OR "Name, 1026" OR "1026 - Name"
      let name = line;
      let id = '';

      if (line.includes('-')) {
        const parts = line.split('-').map(p => p.trim());
        if (/^\d+$/.test(parts[0])) {
          id = parts[0];
          name = parts.slice(1).join('-');
        } else if (/^\d+$/.test(parts[parts.length - 1])) {
          id = parts[parts.length - 1];
          name = parts.slice(0, -1).join('-');
        }
      } else if (line.includes(',')) {
        const parts = line.split(',').map(p => p.trim());
        if (/^\d+$/.test(parts[1])) {
          id = parts[1];
          name = parts[0];
        }
      }

      if (!id) {
        while (existingIds.has(String(nextIdNum))) {
          nextIdNum++;
        }
        id = String(nextIdNum);
        existingIds.add(id);
        nextIdNum++;
      }

      if (name) {
        currentList.push({ id, name });
        existingIds.add(id);
        addedCount++;
      }
    }

    this.saveRoster(currentList);
    return { count: addedCount };
  },

  resetToDefault(): Trainee[] {
    try {
      localStorage.removeItem(STORAGE_KEY_ROSTER);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ROSTER;
  }
};
