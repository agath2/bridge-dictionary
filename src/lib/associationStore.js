import { writable } from 'svelte/store';

export const associationSession = writable([]);
export const associationResults = writable([]);

export function resetAssociation() {
  associationSession.set([]);
  associationResults.set([]);
}
