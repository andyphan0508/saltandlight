import { test } from "node:test";
import assert from "node:assert/strict";
import { judgeAdsTraffic } from "./verdict";
import type { SourceSummary } from "./sessions";

const source = (o: Partial<SourceSummary>): SourceSummary => ({
  source: "facebook_ads",
  label: "Facebook Ads",
  sessions: 100,
  suspectRate: 0,
  instantExitRate: 0,
  bounceRate: 0,
  engagedRate: 0,
  avgDurationMs: 0,
  cartSessions: 0,
  orderSessions: 0,
  conversionRate: 0,
  campaigns: [],
  ...o,
});

test("waste = bots plus instant exits among the rest", () => {
  const v = judgeAdsTraffic([source({ suspectRate: 0.2, instantExitRate: 0.5 })]);
  assert.equal(v.wasteRate, 0.2 + 0.8 * 0.5);
  assert.equal(v.level, "critical");
});

test("levels by waste, and too few sessions is no verdict at all", () => {
  assert.equal(judgeAdsTraffic([source({ instantExitRate: 0.35 })]).level, "warning");
  assert.equal(judgeAdsTraffic([source({ instantExitRate: 0.1 })]).level, "good");
  assert.equal(judgeAdsTraffic([source({ sessions: 5, instantExitRate: 0.9 })]).level, "insufficient");
  assert.equal(judgeAdsTraffic([source({ source: "direct", label: "Trực tiếp" })]).level, "insufficient");
});

test("the busiest paid source is the one judged", () => {
  const v = judgeAdsTraffic([source({ source: "tiktok_ads", label: "TikTok Ads", sessions: 30 }), source({ sessions: 300 })]);
  assert.equal(v.source?.label, "Facebook Ads");
});
