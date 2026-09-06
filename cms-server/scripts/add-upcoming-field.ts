import { openDb } from './_db.ts';
import crypto from 'crypto';

async function main() {
  const { handle } = await openDb();
  const ctId = '519e2c8a-9f09-43f6-886e-313e70b70b2a';
  const now = new Date().toISOString();

  const existing = await handle.db
    .selectFrom('fields')
    .selectAll()
    .where('content_type_id', '=', ctId)
    .where('api_id', '=', 'isUpcoming')
    .executeTakeFirst();

  if (!existing) {
    await handle.db
      .insertInto('fields')
      .values({
        id: crypto.randomUUID(),
        content_type_id: ctId,
        api_id: 'isUpcoming',
        label: 'Upcoming / In Incubation',
        type: 'boolean',
        help_text: 'Turn this on if this committee is upcoming/in-formation. It will appear in the dedicated Upcoming Committees section instead of the active banner.',
        position: 7,
        required: 0,
        localized: 0,
        config: JSON.stringify({ defaultValue: false }),
        created_at: now,
        updated_at: now,
        visible_when: null,
      })
      .execute();
    console.log('Added isUpcoming boolean field to committee content type.');
  } else {
    console.log('isUpcoming field already exists.');
  }

  // Update existing committees in content_items
  const items = await handle.db
    .selectFrom('content_items')
    .selectAll()
    .where('content_type_id', '=', ctId)
    .execute();

  for (const item of items) {
    const data = JSON.parse(item.data);
    const isUp =
      item.slug.includes('upcoming') ||
      item.slug.includes('upcomng') ||
      data.logo === '/logo/Committee/Blank/Logo.png';
    data.isUpcoming = Boolean(data.isUpcoming ?? isUp);
    await handle.db
      .updateTable('content_items')
      .set({ data: JSON.stringify(data), updated_at: now })
      .where('id', '=', item.id)
      .execute();
    console.log(`Updated ${item.slug}: isUpcoming = ${data.isUpcoming}`);
  }

  await handle.destroy();
}

main().catch(console.error);
