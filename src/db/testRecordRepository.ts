import { db } from './database';
import { newId, nowIso } from './ids';
import type { TestRecord } from './types';

/**
 * Example repository. Real modules (sales, purchases, inventory) should follow
 * this pattern: UI code calls these functions and never touches `db` directly.
 */

export async function createTestRecord(label: string): Promise<TestRecord> {
  const now = nowIso();
  const record: TestRecord = {
    id: newId(),
    label,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending', // every new local change starts as pending
  };
  await db.testRecords.add(record);
  return record;
}

export function listTestRecords(): Promise<TestRecord[]> {
  return db.testRecords.orderBy('updatedAt').reverse().toArray();
}

export function listPendingTestRecords(): Promise<TestRecord[]> {
  return db.testRecords.where('syncStatus').equals('pending').toArray();
}

/** Edits a record; it becomes pending again because it now differs from the server. */
export async function updateTestRecordLabel(
  id: string,
  label: string,
): Promise<boolean> {
  const changed = await db.testRecords.update(id, {
    label,
    updatedAt: nowIso(),
    syncStatus: 'pending',
  });
  return changed === 1;
}

/** To be called by the future sync code after a successful upload. */
export async function markTestRecordSynced(id: string): Promise<boolean> {
  const changed = await db.testRecords.update(id, { syncStatus: 'synced' });
  return changed === 1;
}

export function deleteTestRecord(id: string): Promise<void> {
  return db.testRecords.delete(id);
}
