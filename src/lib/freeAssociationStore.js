import { writable } from 'svelte/store';

export const freeAssociationSession = writable([]);
export const freeAssociationResults = writable([]);

export function resetFreeAssociation() {
  freeAssociationSession.set([]);
  freeAssociationResults.set([]);
}
