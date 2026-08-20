import { writable } from 'svelte/store';

// Holds the full session: ordered list of quotes to play
export const session = writable([]);

// Holds the results of each round as the player progresses
// Each entry: { quote, guess, correct, response_time_ms, type }
export const results = writable([]);

// Political affiliation collected once per browser session
// Values: 'Democrat' | 'Republican' | 'Independent' | 'Other' | 'Prefer not to say' | null
export const politicalAffiliation = writable(null);

// Set on /survey once a participant consents. True only if they also met
// all three eligibility criteria — determines whether their session gets
// recorded. Participants never see which of these applied to them.
export const eligibleForRecording = writable(false);

// Resets everything for a fresh game
export function resetGame() {
  session.set([]);
  results.set([]);
}
