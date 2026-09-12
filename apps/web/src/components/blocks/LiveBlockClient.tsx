"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sparkles } from "@/components/Icons";
import { FeatureCardsBlock } from "./FeatureCardsBlock";
import { StoryBannerBlock } from "./StoryBannerBlock";
import { PromoCtaBlock } from "./PromoCtaBlock";
import { TestimonialsBlock } from "./TestimonialsBlock";
import { PageHeroBlock } from "./PageHeroBlock";
import { RichTextSectionsBlock } from "./RichTextSectionsBlock";
import { ContactInfoBlock } from "./ContactInfoBlock";
import { CtaBannerBlock } from "./CtaBannerBlock";

export interface LiveBlockClientProps {
  blockId: string;
  blockType: string;
  blockLabel?: string;
  initialContent: any;
  children: React.ReactNode;
}

export function LiveBlockClient({
  blockId,
  blockType,
  blockLabel,
  initialContent,
  children,
}: LiveBlockClientProps) {
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only activate if inside an iframe and with ?editor=1 query
    const inIframe = typeof window !== "undefined" && window.self !== window.top;
    const isEditorParam =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("editor") === "1";

    if (!inIframe || !isEditorParam) {
      return;
    }

    setIsEditorMode(true);
    // Notify parent admin frame that storefront is loaded
    window.parent.postMessage({ type: "storefront:ready" }, "*");

    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      const isTarget = data.blockId
        ? data.blockId === blockId
        : Boolean(data.blockType) && data.blockType === blockType;

      if (data.type === "block:select") {
        setIsSelected(Boolean(isTarget));
      } else if (data.type === "block:scroll") {
        setIsSelected(Boolean(isTarget));
        if (isTarget) {
          wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } else if (data.type === "block:preview" && isTarget) {
        setPreviewContent(data.content);
      } else if (data.type === "block:reload") {
        window.location.reload();
      }
    }

    function handleAnchorClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (anchor) {
        e.preventDefault();
      }
    }
    document.addEventListener("click", handleAnchorClick, { capture: true });

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, [blockId, blockType]);

  if (!isEditorMode) {
    return <>{children}</>;
  }

  // If live preview content is being edited, dynamically render the client block
  const currentContent = previewContent || initialContent;

  function renderDynamicBlock() {
    if (!previewContent) return children;

    switch (blockType) {
      case "FEATURE_CARDS":
        return <FeatureCardsBlock content={currentContent} />;
      case "STORY_BANNER":
        return <StoryBannerBlock content={currentContent} />;
      case "PROMO_CTA":
        return <PromoCtaBlock content={currentContent} />;
      case "TESTIMONIALS":
        return <TestimonialsBlock content={currentContent} />;
      case "PAGE_HERO":
        return <PageHeroBlock content={currentContent} />;
      case "RICH_TEXT_SECTIONS":
        return <RichTextSectionsBlock content={currentContent} />;
      case "CONTACT_INFO":
        return <ContactInfoBlock content={currentContent} />;
      case "CTA_BANNER":
        return <CtaBannerBlock content={currentContent} />;
      default:
        // For server components (e.g. FeaturedProducts), return children until reload
        return children;
    }
  }

  return (
    <div
      ref={wrapperRef}
      data-block-id={blockId}
      data-block-type={blockType}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSelected(true);
        window.parent.postMessage({ type: "block:select", blockId, blockType }, "*");
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative transition-all duration-200 cursor-pointer group/elementor ${
        isSelected
          ? "outline outline-3 outline-brand-forest outline-offset-4 ring-4 ring-brand-forest/20 rounded-2xl z-20"
          : isHovered
          ? "outline outline-2 outline-sky-500/80 outline-offset-2 rounded-2xl z-10"
          : "hover:outline hover:outline-2 hover:outline-sky-500/50 hover:outline-offset-2"
      }`}
    >
      {/* Floating Elementor action pill */}
      {(isHovered || isSelected) && (
        <div className="absolute -top-3.5 left-4 z-50 flex items-center gap-1.5 rounded-full bg-brand-forest px-3 py-1 text-[11px] font-bold text-white shadow-xl animate-pop-in pointer-events-auto">
          <Sparkles size={12} className="text-mint-300" />
          <span>{blockLabel || blockType}</span>
          <span className="opacity-75 font-normal">| Bấm để chỉnh sửa</span>
        </div>
      )}

      {renderDynamicBlock()}
    </div>
  );
}
