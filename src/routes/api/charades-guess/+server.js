import { OPENAI_API_KEY } from '$env/static/private';
import { json, error } from '@sveltejs/kit';

const WORD_POOL = [
  'affirmative action', 'cancel culture', 'climate change', 'free speech',
  'gun control', 'privilege', 'social justice', 'systemic racism', 'welfare', 'woke'
];

export async function POST({ request }) {
  const { targetWord, history } = await request.json();

  const clueLines = history
    .map((r, i) => `Round ${i + 1} clue: "${r.clue}"`)
    .join('\n');

  const systemPrompt = `You are playing a word-guessing game. The player is describing a word and you must guess it.

You may ONLY guess words from this list:
${WORD_POOL.map(w => `- ${w}`).join('\n')}

Rules:
- Respond with exactly one item from the list above — nothing else, no punctuation, no explanation.
- Use all the clues given so far to make your best guess.
- You may guess the same word more than once if you are still confident.`;

  const userMessage = clueLines || 'No clues yet.';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-5.5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 20,
      temperature: 0.3
    })
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('OpenAI error', res.status, body);
    throw error(502, `OpenAI ${res.status}: ${body}`);
  }

  const data = await res.json();
  const guess = data.choices[0].message.content.trim().toLowerCase();

  const correct = guess === targetWord.toLowerCase();

  return json({ guess, correct });
}
