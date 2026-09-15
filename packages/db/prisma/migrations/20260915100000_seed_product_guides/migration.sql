-- Seed category-level product guides. These three sections used to be
-- auto-injected into every product description (tote bags included); they are
-- now assigned per category in Admin → Hướng dẫn sản phẩm.
-- Only fills an empty column, so it never overwrites guides an admin saved.

INSERT INTO "site_settings" ("id") VALUES ('default') ON CONFLICT ("id") DO NOTHING;

WITH
  tee AS (
    SELECT coalesce(jsonb_agg("id"::text), '[]'::jsonb)::text AS ids
    FROM "categories" WHERE "slug" IN ('ao-thun-nguoi-lon', 'ao-thun-cho-be')
  ),
  adult_tee AS (
    SELECT coalesce(jsonb_agg("id"::text), '[]'::jsonb)::text AS ids
    FROM "categories" WHERE "slug" = 'ao-thun-nguoi-lon'
  )
UPDATE "site_settings"
SET
  "care_guides" = replace(replace($guides$[
    {
      "id": "guide-tee-highlights",
      "title": "Điểm Nổi Bật Của Sản Phẩm",
      "subtitle": "",
      "layout": "list",
      "categoryIds": "@TEE@",
      "items": [
        {"icon": "", "title": "", "content": "Chất liệu 100% Cotton 4 chiều, thấm hút mồ hôi tối đa, thoáng mát."},
        {"icon": "", "title": "", "content": "Công nghệ in DTG cao cấp, không nứt gãy hoặc phai màu sau khi giặt."},
        {"icon": "", "title": "", "content": "Form dáng Regular Fit chuẩn Unisex, dễ dàng phối đồ đi học, đi làm, đi nhóm."},
        {"icon": "", "title": "", "content": "Đóng gói chỉn chu kèm bookmark Lời Chúa và thiệp cảm ơn."}
      ],
      "isActive": true
    },
    {
      "id": "guide-adult-tee-size-chart",
      "title": "Bảng Quy Đổi Size Áo",
      "subtitle": "Chiều cao | Cân nặng | Dài / Rộng áo",
      "layout": "table",
      "categoryIds": "@ADULT_TEE@",
      "items": [
        {"icon": "", "title": "Size S", "content": "1m50 - 1m62 | 42 - 52 kg | Dài 66cm / Rộng 48cm"},
        {"icon": "", "title": "Size M", "content": "1m60 - 1m70 | 53 - 62 kg | Dài 69cm / Rộng 51cm"},
        {"icon": "", "title": "Size L", "content": "1m68 - 1m76 | 63 - 72 kg | Dài 72cm / Rộng 54cm"},
        {"icon": "", "title": "Size XL", "content": "1m75 - 1m85 | 73 - 85 kg | Dài 75cm / Rộng 57cm"}
      ],
      "isActive": true
    },
    {
      "id": "guide-tee-care",
      "title": "Hướng Dẫn Giặt Ủi & Bảo Quản Áo Thun",
      "subtitle": "Áp dụng cho các dòng áo thun 100% Cotton cao cấp từ Salt & Light",
      "layout": "cards",
      "categoryIds": "@TEE@",
      "items": [
        {"icon": "🧼", "title": "Giặt áo đúng cách", "content": "Nên lộn trái áo trước khi giặt. Ưu tiên giặt nước lạnh hoặc ấm dưới 30°C. Không ngâm quá 15 phút với bột giặt có chất tẩy mạnh."},
        {"icon": "🌤️", "title": "Phơi nơi râm mát", "content": "Giũ nhẹ áo và phơi ở nơi thoáng gió, bóng râm mát. Tránh phơi trực tiếp dưới nắng gắt để giữ màu vải luôn tươi sáng."},
        {"icon": "👔", "title": "Ủi & là hơi an toàn", "content": "Ủi ở nhiệt độ trung bình. Không ủi trực tiếp lên bề mặt hình in (nên ủi mặt trái hoặc lót vải mỏng)."},
        {"icon": "🛡️", "title": "Bảo vệ hình in", "content": "Không vặn xoắn mạnh tay ngay vị trí hình in. Treo bằng móc áo vừa vặn để giữ form cổ áo luôn đẹp."}
      ],
      "isActive": true
    }
  ]$guides$, '"@TEE@"', (SELECT ids FROM tee)), '"@ADULT_TEE@"', (SELECT ids FROM adult_tee))::jsonb,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = 'default'
  AND ("care_guides" IS NULL OR "care_guides" = '[]'::jsonb);
