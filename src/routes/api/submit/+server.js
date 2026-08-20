import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const { game, affiliation, session_data, eligible } = await request.json();

  if (!game || !session_data) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Ineligible participants are allowed to play, but their session is never
  // written to the database. Report success either way so nothing looks
  // broken on the client.
  if (!eligible) {
    return json({ ok: true, recorded: false });
  }

  const sql = neon(DATABASE_URL);

  await sql`
    INSERT INTO game_sessions (game, affiliation, session_data)
    VALUES (${game}, ${affiliation ?? null}, ${JSON.stringify(session_data)})
  `;

  return json({ ok: true, recorded: true });
}
