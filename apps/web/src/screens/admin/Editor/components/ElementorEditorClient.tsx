"use client";

import { useRef, useState } from "react";
import { Button } from "@saltandlight/ui";
import { Pencil } from "@/components/admin/Icons";
import { MANAGED_PAGES } from "@/helpers/managed-pages";
import { usePageBlockEditor } from "@/hooks/use-page-block-editor";
import type { PageBlockItem, PreviewDevice } from "@/interfaces/page-block";
import { BlockEditForm } from "./BlockEditForm";
import { BlockLibrary } from "./BlockLibrary";
import { BlockNavigator } from "./BlockNavigator";
import { EditorPanelTabs } from "./EditorPanelTabs";
import { EditorTopbar } from "./EditorTopbar";
import { PreviewCanvas } from "./PreviewCanvas";

interface ElementorEditorClientProps {
  initialPage: string;
  initialBlocks: PageBlockItem[];
}

/** Live Editor: block panel on the left, storefront preview on the right, kept in sync via postMessage. */
export const ElementorEditorClient = ({ initialPage = "home", initialBlocks = [] }: ElementorEditorClientProps) => {
  const editor = usePageBlockEditor({ initialPage, initialBlocks });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const page = MANAGED_PAGES.find((p) => p.slug === editor.currentPage) ?? MANAGED_PAGES[0];

  // The preview iframe is same-origin, so messages are never sent to other origins
  const postToPreview = (message: Record<string, unknown>) =>
    iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);

  const onSelectBlock = (block: PageBlockItem) => {
    editor.onEditBlock(block);
    postToPreview({ type: "block:select", blockId: block.id });
    postToPreview({ type: "block:scroll", blockId: block.id });
  };

  const onLivePreviewChange = (content: Record<string, any>) => {
    if (editor.editingBlock) postToPreview({ type: "block:preview", blockId: editor.editingBlock.id, content });
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 overflow-hidden select-none">
      <EditorTopbar
        currentPage={editor.currentPage}
        pagePath={page.path}
        device={device}
        onSwitchPage={editor.onSwitchPage}
        onDeviceChange={setDevice}
        onReloadPreview={editor.onReloadPreview}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full sm:w-[420px] lg:w-[460px] xl:w-[480px] flex-shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          <EditorPanelTabs activeTab={editor.activeTab} blockCount={editor.blocks.length} onTabChange={editor.setActiveTab} />

          <div className="flex-1 overflow-y-auto">
            {editor.activeTab === "navigator" && (
              <BlockNavigator
                blocks={editor.blocks}
                editingBlockId={editor.editingBlock?.id}
                deletingId={editor.deletingId}
                isSeeding={editor.isSeeding}
                onReorder={editor.onReorder}
                onSelect={onSelectBlock}
                onToggleVisible={editor.onToggleVisible}
                onDelete={editor.onDeleteBlock}
                onSeedDefaults={editor.onSeedDefaultBlocks}
                onOpenLibrary={() => editor.setActiveTab("palette")}
              />
            )}

            {editor.activeTab === "edit" && (
              <div className="h-full">
                {editor.editingBlock ? (
                  <BlockEditForm
                    key={editor.editingBlock.id}
                    page={editor.currentPage}
                    block={editor.editingBlock}
                    defaultType={editor.editingBlock.type}
                    onClose={() => editor.setActiveTab("navigator")}
                    onSaved={editor.onBlockSaved}
                    onChangePreview={onLivePreviewChange}
                  />
                ) : (
                  <div className="py-16 px-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-mint-50 border border-brand-forest/20 flex items-center justify-center mx-auto text-brand-forest">
                      <Pencil size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Chưa chọn khối nào</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Vui lòng click vào 1 khối từ tab Cấu trúc hoặc click trực tiếp vào khối trên trang web xem trước để chỉnh sửa.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => editor.setActiveTab("navigator")}
                      className="rounded-xl px-4 py-1.5 text-xs font-semibold"
                    >
                      Xem danh sách khối
                    </Button>
                  </div>
                )}
              </div>
            )}

            {editor.activeTab === "palette" && (
              <BlockLibrary onAdd={editor.onAddBlock} onBack={() => editor.setActiveTab("navigator")} />
            )}
          </div>
        </div>

        <PreviewCanvas
          device={device}
          src={`${page.path}?editor=1`}
          frameKey={`${editor.currentPage}-${editor.previewVersion}`}
          iframeRef={iframeRef}
        />
      </div>
    </div>
  );
};
