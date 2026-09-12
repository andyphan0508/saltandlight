import { BlockRenderer, type PageBlockData } from "@/components/blocks/BlockRenderer";

export interface PolicyViewProps {
  blocks: PageBlockData[];
}

export const PolicyView = ({ blocks }: PolicyViewProps) => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16 space-y-12 animate-slide-up-fade">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
};
