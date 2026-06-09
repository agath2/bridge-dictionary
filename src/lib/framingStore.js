import { writable } from 'svelte/store';

export const framingSession = writable([]);
export const framingResults  = writable([]);

export function resetFramingGame() {
  framingSession.set([]);
  framingResults.set([]);
}
