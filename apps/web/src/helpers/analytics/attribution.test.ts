import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyDevice, classifySource, trafficFlags } from "./attribution";

const CHROME = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";
const src = (search: string, referrer = "", userAgent = CHROME) =>
  classifySource({ search, referrer, siteHost: "saltandlight.com.vn", userAgent });

test("a tagged ad link is recognised as the ad, with its campaign", () => {
  assert.deepEqual(src("?utm_source=facebook&utm_medium=paid&utm_campaign=Giang-Sinh-15h"), {
    source: "facebook_ads",
    campaign: "Giang-Sinh-15h",
    medium: "paid",
  });
  assert.equal(src("?utm_source=fb&utm_medium=cpc").source, "facebook_ads");
  assert.equal(src("?utm_source=instagram&utm_medium=paid_social").source, "facebook_ads", "Meta ads on Instagram");
  assert.equal(src("?utm_source=tiktok&utm_medium=ads").source, "tiktok_ads");
  assert.equal(src("?utm_source=facebook&utm_medium=post").source, "facebook", "a tagged organic post is not an ad");
});

test("fbclid alone is Facebook but not proof of an ad; gclid / ttclid are ads", () => {
  assert.equal(src("?fbclid=IwAR123").source, "facebook");
  assert.equal(src("?gclid=abc").source, "google_ads");
  assert.equal(src("?ttclid=abc").source, "tiktok_ads");
});

test("the referrer decides untagged visits; our own pages and missing referrers don't count as sources", () => {
  assert.equal(src("", "https://l.facebook.com/l.php?u=x").source, "facebook");
  assert.equal(src("", "https://www.google.com.vn/").source, "google");
  assert.equal(src("", "https://zalo.me/g/abc").source, "zalo");
  assert.equal(src("", "https://someblog.vn/post").source, "referral");
  assert.equal(src("", "https://saltandlight.com.vn/san-pham").source, "direct");
  assert.equal(src("", "").source, "direct");
});

test("Facebook's in-app browser sends no referrer but is still Facebook", () => {
  const fbInApp = `${CHROME} [FBAN/FBIOS;FBAV/450.0]`;
  assert.equal(src("", "", fbInApp).source, "facebook");
});

test("bots, automation and datacenter networks are flagged; a phone on a home ISP is not", () => {
  assert.deepEqual(trafficFlags({ userAgent: CHROME, isAutomated: false, asOrganization: "Viettel Group" }), []);
  assert.deepEqual(trafficFlags({ userAgent: "facebookexternalhit/1.1", isAutomated: false, asOrganization: "Facebook" }), ["bot"]);
  assert.deepEqual(trafficFlags({ userAgent: CHROME, isAutomated: true, asOrganization: "Amazon.com, Inc." }), ["auto", "dc"]);
  assert.deepEqual(trafficFlags({ userAgent: "", isAutomated: false, asOrganization: "" }), ["bot"]);
});

test("device from user agent", () => {
  assert.equal(classifyDevice(CHROME), "mobile");
  assert.equal(classifyDevice("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)"), "tablet");
  assert.equal(classifyDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15"), "desktop");
});
