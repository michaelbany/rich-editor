import type { NodeFragment } from "~/types";

export function cursorAPI(context: EditorContext) {
  return {
    trigger: (s: Selection) => {
      if (!context.Cursor.validate(s)) return;

      const anchorNode = context.Node.find(s.anchorNode?.parentElement?.id as NodeFragment['id']);
      if (!anchorNode) return;

      const anchorText = anchorNode.element()?.textContent ?? "";

      context.state.cursor.set({
        type: "cursor",
        block: anchorNode.block_id,
        node: anchorNode.id,
        offset: realTextOffsetWithoutZWS(anchorText, s.anchorOffset),
        absolute: context.Cursor.offsets(s, anchorNode),
      });
    },
    offsets: (s: Selection, node: NonNullable<NodeModel>): { start: number; end: number } => {
      let selectionAbsoluteOffset = 0;

      node?.siblings()?.forEach((sibling, index) => {
        if (index < node.index) {
          selectionAbsoluteOffset += sibling ? realTextLengthWithoutZWS(sibling.text) : 0;
        }
      });

      const anchorText = node.element()?.textContent ?? "";

      selectionAbsoluteOffset += realTextOffsetWithoutZWS(anchorText, s.anchorOffset);

      return {
        start: selectionAbsoluteOffset,
        end: (node?.block()?.text().length ?? 0) - selectionAbsoluteOffset,
      };
    },
    move: async (block: NonNullable<BlockModel>, offset: number) => {
      await nextTick();
      let { startNode, startOffset } = context.Block.childrenInRange(block, offset, offset);

      // move cursor at the end of the block
      if (!startNode) {
        startNode = block.nodes()[block.nodes().length - 1];
        startOffset = startNode.text.length;
      }

      const startChild = startNode.element()?.firstChild;

      if (startChild) {
        const s = window.getSelection();
        const r = document.createRange();
        r.setStart(startChild, startOffset);

        s?.removeAllRanges();
        s?.addRange(r);
      }
    },
    boundary: () => {
      context.Cursor.validate(window.getSelection() as Selection);

      const selection = window.getSelection();
      if (!selection) return;

      const range = selection.getRangeAt(0);
      return range.getBoundingClientRect();
    },
    validate: (s: Selection): boolean => {
      const anchorNodeId = s.anchorNode?.parentElement?.id;
      const focusNodeId = s.focusNode?.parentElement?.id;

      /** Is the selection valid */
      if (!anchorNodeId || !focusNodeId) {
        // console.warn("Cursor not defined");
        return false;
      }

      /** Does the selected nodes know by editor */
      if (
        !context.document.blocks.some(
          (block) => anchorNodeId.includes(block.id) && focusNodeId.includes(block.id)
        )
      ) {
        console.warn("Cursor is not in the editor");
        return false;
      }

      return true;
    },
  };
}

export type CursorAPI = ReturnType<typeof cursorAPI>;
