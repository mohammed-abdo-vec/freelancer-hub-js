import { randomUUID } from 'node:crypto';
import { db, type UsageRecord } from '../db/store.js';
import type { ProviderId, TokenUsage, UsageBucket, UsageSummary } from '../types/api.js';

export function recordUsage(
  userId: string,
  providerId: ProviderId,
  model: string,
  source: UsageRecord['source'],
  usage: TokenUsage | null,
) {
  db.write((d) =>
    d.usage.push({
      id: randomUUID(),
      userId,
      providerId,
      model,
      source,
      inputTokens: usage?.inputTokens ?? 0,
      outputTokens: usage?.outputTokens ?? 0,
      createdAt: new Date().toISOString(),
    }),
  );
}

const emptyBucket = (): UsageBucket => ({ requests: 0, inputTokens: 0, outputTokens: 0 });
const add = (b: UsageBucket, r: UsageRecord) => {
  b.requests += 1;
  b.inputTokens += r.inputTokens;
  b.outputTokens += r.outputTokens;
};
const day = (d: Date) => d.toISOString().slice(0, 10);

export function summarizeUsage(userId: string, rangeDays: number): UsageSummary {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (rangeDays - 1));
  const records = db.data.usage.filter((r) => r.userId === userId && new Date(r.createdAt) >= since);

  const totals = emptyBucket();
  const byProvider = new Map<ProviderId, UsageBucket>();
  const byModel = new Map<string, UsageBucket & { providerId: ProviderId; model: string }>();
  const daily = new Map<string, UsageBucket>();
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    daily.set(day(d), emptyBucket());
  }

  for (const r of records) {
    add(totals, r);
    if (!byProvider.has(r.providerId)) byProvider.set(r.providerId, emptyBucket());
    add(byProvider.get(r.providerId)!, r);
    const mk = `${r.providerId}/${r.model}`;
    if (!byModel.has(mk)) byModel.set(mk, { ...emptyBucket(), providerId: r.providerId, model: r.model });
    add(byModel.get(mk)!, r);
    const bucket = daily.get(r.createdAt.slice(0, 10));
    if (bucket) add(bucket, r);
  }

  return {
    rangeDays,
    totals,
    byProvider: [...byProvider].map(([providerId, b]) => ({ providerId, ...b })).sort((a, b) => b.requests - a.requests),
    byModel: [...byModel.values()].sort((a, b) => b.requests - a.requests).slice(0, 10),
    daily: [...daily].map(([date, b]) => ({ date, ...b })),
  };
}
