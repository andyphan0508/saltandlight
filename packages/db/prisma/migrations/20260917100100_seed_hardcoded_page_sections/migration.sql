-- Turns the sections that were hardcoded in the page screens into real,
-- editable page blocks, with exactly the content those screens rendered — so
-- every page looks the same right after this runs. Generated from
-- apps/web/src/helpers/page-block-seeds.ts. Each step is skipped if the page
-- already has that block type, so re-running is harmless.

-- Homepage: the brand intro sat above every block.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "page_blocks" WHERE "page" = 'home' AND "type" = 'INTRO_STORY') THEN
    UPDATE "page_blocks" SET "sort_order" = "sort_order" + 1 WHERE "page" = 'home';
    INSERT INTO "page_blocks" ("page", "type", "sort_order", "is_visible", "content", "updated_at")
    VALUES ('home', 'INTRO_STORY', 0, true, '{"palette":"warm","emblemUrl":"/images/logo-emblem.webp","eyebrow":"Áo thun lời Chúa - Salt and Light","headline":"Giới thiệu","body":"Chúng mình mong muốn mang đến những sản phẩm Cơ Đốc chất lượng, đa dạng mẫu mã, giá thành phải chăng, và quan trọng hơn hết là có tính ứng dụng cao để bạn có thể dễ dàng sử dụng ở mọi nơi... Đó cũng là cách chúng mình sống như “muối” và “ánh sáng” cho Chúa, lan toả tình yêu của Ngài đến mọi người!","imageUrl":"","imageAlt":"Salt & Light","buttons":[]}'::jsonb, now());
  END IF;
END $$;

-- About: the story sat right after the page hero.
DO $$
DECLARE hero_order int;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "page_blocks" WHERE "page" = 'gioi-thieu' AND "type" = 'INTRO_STORY') THEN
    SELECT min("sort_order") INTO hero_order FROM "page_blocks" WHERE "page" = 'gioi-thieu' AND "type" = 'PAGE_HERO';
    hero_order := COALESCE(hero_order, -1);
    UPDATE "page_blocks" SET "sort_order" = "sort_order" + 1 WHERE "page" = 'gioi-thieu' AND "sort_order" > hero_order;
    INSERT INTO "page_blocks" ("page", "type", "sort_order", "is_visible", "content", "updated_at")
    VALUES ('gioi-thieu', 'INTRO_STORY', hero_order + 1, true, '{"palette":"forest","emblemUrl":"","eyebrow":"‘Áo Câu Gốc Thì Chắc Chỉ Mặc Đi Trại Được Thôi?’","headline":"Đó Cũng Là Lí Do Salt & Light Được Ra Đời...","body":"Chúng mình mong muốn mang đến những sản phẩm Cơ Đốc chất lượng, đa dạng mẫu mã, giá thành phải chăng, và quan trọng hơn hết là có tính ứng dụng cao để bạn có thể dễ dàng sử dụng ở mọi nơi... Đó cũng là cách chúng mình sống như “muối” và “ánh sáng” cho Chúa, lan toả tình yêu của Ngài đến mọi người!","imageUrl":"/images/about-story.webp","imageAlt":"Salt & Light - Áo thun câu gốc Cơ Đốc","buttons":[{"label":"Khám phá sản phẩm","href":"/san-pham","variant":"primary"},{"label":"Liên hệ chúng mình","href":"/lien-he","variant":"outline"}]}'::jsonb, now());
  END IF;
END $$;

-- Custom order: the commitments card + quote form sat after every block.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "page_blocks" WHERE "page" = 'dat-theo-yeu-cau' AND "type" = 'CONTACT_FORM') THEN
    INSERT INTO "page_blocks" ("page", "type", "sort_order", "is_visible", "content", "updated_at")
    SELECT 'dat-theo-yeu-cau', 'CONTACT_FORM', COALESCE(max("sort_order"), -1) + 1, true, '{"headline":"Gửi Thông Tin Yêu Cầu Báo Giá","formType":"custom_order","aside":"checklist","asideTitle":"Cam Kết Từ Salt & Light","asideItems":["Thiết kế demo miễn phí đến khi bạn hài lòng.","Chất vải 100% Cotton 4 chiều không phai, không xù.","Đa dạng form size: Trẻ em, Nam, Nữ, Oversize.","Chiết khấu trực tiếp lên đến 25% cho số lượng lớn."],"isHotlineShown":true,"contactItems":[]}'::jsonb, now()
    FROM "page_blocks" WHERE "page" = 'dat-theo-yeu-cau';
  END IF;
END $$;

-- Contact: the page pinned its CONTACT_INFO block in a column beside a
-- hardcoded form. The form block now carries those channels beside it, taking
-- the info block's place and content; the old block is hidden, not deleted.
DO $$
DECLARE info_row record;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "page_blocks" WHERE "page" = 'lien-he' AND "type" = 'CONTACT_FORM') THEN
    SELECT "id", "sort_order", "content" INTO info_row FROM "page_blocks"
    WHERE "page" = 'lien-he' AND "type" = 'CONTACT_INFO' AND "is_visible" = true
    ORDER BY "sort_order" LIMIT 1;

    IF info_row."id" IS NOT NULL THEN
      INSERT INTO "page_blocks" ("page", "type", "sort_order", "is_visible", "content", "updated_at")
      VALUES (
        'lien-he', 'CONTACT_FORM', info_row."sort_order", true,
        '{"headline":"Gửi Tin Nhắn Cho Shop","formType":"contact","aside":"contact_info","asideTitle":"","asideItems":[],"isHotlineShown":false}'::jsonb
          || jsonb_build_object(
            'contactItems', COALESCE(info_row."content" -> 'items', '[]'::jsonb),
            'quote', COALESCE(info_row."content" ->> 'quote', ''),
            'quoteRef', COALESCE(info_row."content" ->> 'quoteRef', '')
          ),
        now()
      );
      UPDATE "page_blocks" SET "is_visible" = false WHERE "id" = info_row."id";
    ELSE
      INSERT INTO "page_blocks" ("page", "type", "sort_order", "is_visible", "content", "updated_at")
      SELECT 'lien-he', 'CONTACT_FORM', COALESCE(max("sort_order"), -1) + 1, true, '{"headline":"Gửi Tin Nhắn Cho Shop","formType":"contact","aside":"contact_info","asideTitle":"","asideItems":[],"isHotlineShown":false,"contactItems":[{"icon":"Phone","label":"Hotline & Zalo Tư Vấn","value":"0847 25 2025","note":"Hỗ trợ 8h00 - 21h00 hàng ngày"},{"icon":"Mail","label":"Email Hỗ Trợ","value":"saltandlight.lienhe@gmail.com","note":"Phản hồi trong 24 giờ làm việc"},{"icon":"MapPin","label":"Địa Chỉ","value":"TP. Hồ Chí Minh","note":"Giao hàng toàn quốc"}],"quote":"Hãy siêng năng mà chớ làm biếng; phải có lòng sốt sắng; phải hầu việc Chúa.","quoteRef":"Rô-ma 12:11"}'::jsonb, now()
      FROM "page_blocks" WHERE "page" = 'lien-he';
    END IF;
  END IF;
END $$;
