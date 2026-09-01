export const metadata = { title: "Chính sách đổi trả" };

export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-center font-display text-2xl font-black uppercase">
        Chính sách đổi trả &amp; hướng dẫn chọn size
      </h1>
      <div className="prose prose-sm mt-8 max-w-none text-ink/70">
        <p>
          Nội dung chính sách đổi trả và bảng quy đổi size (chiều cao/cân nặng) sẽ được cập
          nhật tại đây — trích xuất thủ công từ các trang Elementor trên site WordPress cũ
          theo mục 9.5 của spec migration.
        </p>
      </div>
    </div>
  );
}
