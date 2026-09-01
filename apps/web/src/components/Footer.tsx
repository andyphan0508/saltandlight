import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-mint-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-display text-lg font-black uppercase">Salt &amp; Light</div>
          <p className="mt-3 text-sm text-ink/70">
            Thời trang &amp; quà tặng Cơ Đốc — chúng mình mong muốn trở thành &ldquo;muối&rdquo; và
            &ldquo;ánh sáng&rdquo; mang lời Chúa đến cho nhiều người.
          </p>
        </div>
        <FooterCol
          title="Mua sắm"
          links={[
            { href: "/san-pham", label: "Tất cả sản phẩm" },
            { href: "/danh-muc/ao-thun-nguoi-lon", label: "Áo thun người lớn" },
            { href: "/danh-muc/ao-thun-cho-be", label: "Áo thun cho bé" },
            { href: "/danh-muc/tui-tote-canvas", label: "Túi tote canvas" },
          ]}
        />
        <FooterCol
          title="Hỗ trợ"
          links={[
            { href: "/tra-cuu-don-hang", label: "Tra cứu đơn hàng" },
            { href: "/dat-theo-yeu-cau", label: "Đặt theo yêu cầu" },
            { href: "/chinh-sach", label: "Chính sách đổi trả" },
            { href: "/lien-he", label: "Liên hệ" },
          ]}
        />
        <div>
          <div className="text-xs font-bold uppercase tracking-wide">Liên hệ</div>
          <ul className="mt-3 space-y-2 text-sm text-ink/70">
            <li>Email: saltandlight.lienhe@gmail.com</li>
            <li>Hotline: (+84) 847 25 2025</li>
            <li>TP. Hồ Chí Minh</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10 py-4 text-center text-xs text-ink/50">
        © {new Date().getFullYear()} Salt &amp; Light. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-ink/70">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
