import { writable } from 'svelte/store';

export const networkSession = writable([]); // ordered headwords for this session
export const networkResults = writable([]); // { headword, r_frame, d_frame, satellite_words, clicked[] }

export function resetNetwork() {
  networkSession.set([]);
  networkResults.set([]);
}
