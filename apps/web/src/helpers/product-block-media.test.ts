import { test } from "node:test";
import assert from "node:assert/strict";
import { INTERVAL_DEFAULT_MS, INTERVAL_MAX_MS, INTERVAL_MIN_MS, readBlockMedia } from "./product-block-media";

test("a block saved before the media slot existed becomes a one-image slot", () => {
  const media = readBlockMedia({ imageUrl: " /img/banner.webp ", imageHref: "/danh-muc/ao" });
  assert.deepEqual(media.slides, [{ url: "/img/banner.webp", href: "/danh-muc/ao", alt: "" }]);
  assert.equal(media.effect, "none");
  assert.equal(media.isAutoplay, false);
});

test("an effect needs two slides, and autoplay needs an effect", () => {
  const single = readBlockMedia({
    media: { slides: [{ url: "/a.webp" }], effect: "fade", isAutoplay: true },
  });
  assert.equal(single.effect, "none", "one slide cannot animate between slides");
  assert.equal(single.isAutoplay, false, "autoplay must not survive the effect being dropped");
  assert.equal(single.hasDots, false);

  const many = readBlockMedia({
    media: { slides: [{ url: "/a.webp" }, { url: "/b.webp" }], effect: "fade", isAutoplay: true },
  });
  assert.equal(many.effect, "fade");
  assert.equal(many.isAutoplay, true);
  assert.equal(many.hasDots, true, "dots default to on once there is an effect");
});

test("blank slides are dropped and an unknown effect falls back to a fixed image", () => {
  const media = readBlockMedia({
    media: { slides: [{ url: "" }, { url: "  " }, { url: "/b.webp" }, {}, null], effect: "kenburns" },
  });
  assert.deepEqual(media.slides.map((s) => s.url), ["/b.webp"]);
  assert.equal(media.effect, "none");
});

test("the autoplay interval is clamped instead of trusted", () => {
  assert.equal(readBlockMedia({ media: { intervalMs: 500 } }).intervalMs, INTERVAL_MIN_MS);
  assert.equal(readBlockMedia({ media: { intervalMs: 999999 } }).intervalMs, INTERVAL_MAX_MS);
  assert.equal(readBlockMedia({ media: { intervalMs: "abc" } }).intervalMs, INTERVAL_DEFAULT_MS);
  assert.equal(readBlockMedia(undefined).intervalMs, INTERVAL_DEFAULT_MS);
  assert.equal(readBlockMedia({ media: { intervalMs: 4000 } }).intervalMs, 4000);
});

test("an empty slot reads as no slides at all", () => {
  assert.deepEqual(readBlockMedia({}).slides, []);
  assert.deepEqual(readBlockMedia(null).slides, []);
});
