export function cursorAPI(context: EditorContext) {
    return {
        trigger: (s: Selection) => {
          if (!context.Cursor.validate(s)) return;
    
          const anchorNode = context.Node.find(s.anchorNode?.parentElement?.id);
          if (!anchorNode) return;
    
          context.state.cursor.set({
            type: "cursor",
            block: anchorNode.block_id,
            node: anchorNode.id,
            offset: s.anchorOffset,
            absolute: context.Cursor.offsets(s, anchorNode),
          });
        },
        offsets: (s: Selection, node: NonNullable<NodeModel>): { start: number; end: number } => {
          let selectionAbsoluteOffset = 0;
    
          node?.siblings()?.forEach((sibling, index) => {
            if (index < node.index) {
              selectionAbsoluteOffset += sibling?.text?.length ?? 0;
            }
          });
    
          selectionAbsoluteOffset += s.anchorOffset;
    
          return {
            start: selectionAbsoluteOffset,
            end: (node?.block()?.text().length ?? 0) - selectionAbsoluteOffset,
          };
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

