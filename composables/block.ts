import type { Block, ParagraphBlock } from "~/types";

export function blockAPI(context: EditorContext) {
  return {
    find: (id?: string): BlockModel => context.model.block(id),
    collect: (ids: string[]): BlockModel[] => ids.map((id) => context.model.block(id)),
    childrenInRange: (block: NonNullable<BlockModel>, start: number, end: number) => {
      const nodes = block.nodes();
      let currentOffset = 0;

      let startNode = null,
        endNode = null;
      let startOffset = 0,
        endOffset = 0;

      for (const node of nodes) {
        const length = node.text.length;

        // Obscure condition when manipulating with cursor
        let shouldBeStart = start === end ? currentOffset + length >= start : currentOffset + length > start;

        if (!startNode && shouldBeStart) {
          startNode = node;
          startOffset = start - currentOffset;
        }

        if (!endNode && currentOffset + length >= end) {
          endNode = node;
          endOffset = end - currentOffset;
          break;
        }

        currentOffset += length;
      }

      return { startNode, startOffset, endNode, endOffset };
    },
    create: async (index: number) => {
      const block: ParagraphBlock = {
        id: crypto.randomUUID(),
        type: "paragraph",
        nodes: [{ text: ""}],
        props: {},
      }

      context.document.blocks.splice(index, 0, block);

      await nextTick();

      const newBlock = context.Block.find(block.id) as NonNullable<BlockModel>;

      context.Cursor.move(newBlock, 0);
    },
    remove: (block: NonNullable<BlockModel>) => {
      const index = block.index;
      const previousBlock = block.previous();

      if (!previousBlock) return;

      context.document.blocks.splice(index, 1);
      context.Cursor.move(previousBlock, previousBlock.text().length);
    },
    // convert: () => {},
    // move: () => {},
    // remove: () => {},
    // insert: () => {},
  };
}

export type BlockAPI = ReturnType<typeof blockAPI>;
