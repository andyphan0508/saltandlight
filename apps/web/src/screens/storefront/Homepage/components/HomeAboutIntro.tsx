import Image from "next/image";

export const HomeAboutIntro = () => {
  return (
    <section className="relative overflow-hidden py-8 sm:py-12">
      <div className="w-full px-4 text-center">
        {/* Brand Logo */}
        <div className="relative inline-flex items-center justify-center transition-transform hover:scale-105 duration-200 mb-3 sm:mb-4">
          <Image
            src="/images/logo-emblem.webp"
            alt="Salt & Light"
            width={140}
            height={140}
            sizes="140px"
            className="h-28 w-28 sm:h-36 sm:w-36 object-contain"
            priority
          />
        </div>

        {/* 1. Title - Color #2096c7 */}
        <h2 className="text-sm sm:text-base font-semibold tracking-wide italic text-[#2096c7]">
          Áo thun lời Chúa - Salt and Light
        </h2>

        {/* 2. Heading - Color #b66700 */}
        <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#b66700]">
          Giới thiệu
        </h1>

        {/* 3. Description - Color #6b727c */}
        <p className="mt-3.5 text-sm sm:text-base text-[#6b727c] leading-relaxed font-normal w-full px-12">
          Chúng mình mong muốn mang đến những sản phẩm Cơ Đốc chất lượng, đa dạng mẫu mã, giá thành phải chăng, và quan trọng hơn hết là có tính ứng dụng cao để bạn có thể dễ dàng sử dụng ở mọi nơi... Đó cũng là cách chúng mình sống như &ldquo;muối&rdquo; và &ldquo;ánh sáng&rdquo; cho Chúa, lan toả tình yêu của Ngài đến mọi người!
        </p>
      </div>
    </section>
  );
};
