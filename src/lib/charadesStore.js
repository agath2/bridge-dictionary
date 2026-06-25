import { writable } from 'svelte/store';

export const charadesWord = writable(null);
export const charadesHistory = writable([]);
export const charadesStatus = writable('playing'); // 'playing' | 'correct' | 'gaveup'

export function resetCharades() {
  charadesWord.set(null);
  charadesHistory.set([]);
  charadesStatus.set('playing');
}
