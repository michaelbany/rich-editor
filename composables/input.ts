/**
 * Handles text input that affects the node's text.
 */
export function inputAPI(context: EditorContext) {
  return {
    trigger: (e: InputEvent) => {
      switch (e.inputType) {
        case "insertText":
          e.preventDefault();
          context.Input.write(e);
          break;
        case "deleteContentBackward":
          e.preventDefault();
          context.Input.delete(e, "backward");
          break;
        case "deleteContentForward":
          e.preventDefault();
          context.Input.delete(e, "forward");
          break;
        case "formatBold":
          e.preventDefault();
          context.Node.style("bold");
          break;
        case "formatItalic":
          e.preventDefault();
          context.Node.style("italic");
          break;
        case "insertParagraph":
          e.preventDefault();
          const cursor = context.state.cursor.get();
          const currentBlock = context.Block.find(cursor?.block) as NonNullable<BlockModel>;

          if (cursor && cursor.absolute.end !== 0) {
            const node = context.Node.find(cursor.node) as NonNullable<NodeModel>;

            context.Block.split(currentBlock, {
              node,
              offset: cursor.offset,
            });
          } else {
            context.Block.create(currentBlock.index + 1);
          }

          break;
        default:
          console.error("refused", e.inputType);
          e.preventDefault();
          break;
      }

      /**
       * Other input types:
       * - insertParagraph (after Enter)
       * - deleteSoftLineBackward (Shift + Backspace)
       * - deleteSoftLineForward (Shift + Delete)
       */
    },
    /** Calls on compositionEnd */
    compose: (e: CompositionEvent) => {
      if (!context.Input.validate(e)) return;
      context.Input.write(e);
    },
    /** Generic function to write text somewhere */
    write: (e: InputEvent | CompositionEvent) => {
      const cursor = context.state.cursor.get();
      const block = context.Block.find((e.target as HTMLElement).id) as NonNullable<BlockModel>;

      if (!cursor || !block) return;

      const text = e.data ?? "";

      const node = context.Node.find(cursor.node) as NonNullable<NodeModel>;
      node.setText(text, cursor.offset);

      context.document.blocks[block.index].nodes[node.index].text = node.text;
      context.Cursor.move(block, cursor.absolute.start + text.length);
    },
    delete: (e: InputEvent, direction: "forward" | "backward") => {
      const cursor = context.state.cursor.get();
      const block = context.Block.find((e.target as HTMLElement).id) as NonNullable<BlockModel>;

      if (!cursor || !block) return;

      if (cursor.absolute.start === 0 && direction === "backward") {
        if (block.text().length === 0) {
          context.Block.remove(block);
        } else {
            // put content to previous block and remove this block
            context.Block.merge(block, block.previous());
        }
        return;
      }
      if (cursor.absolute.end === 0 && direction === "forward") return;

      const node = context.Node.find(cursor.node) as NonNullable<NodeModel>;

      const deleteLength = direction === "forward" ? 1 : -1;
      const text =
        node.text.slice(0, cursor.offset + deleteLength) + node.text.slice(cursor.offset);

      node.setText(text);

      context.document.blocks[block.index].nodes[node.index].text = node.text;

      if (node.text.length === 0) {
        context.Node.remove(node);
      }

      context.Cursor.move(block, cursor.absolute.start + deleteLength);
    },
    paste: () => {
      console.log("Paste");
    },
    cut: () => {
      console.log("Cut");
    },
    validate: (e: Event) => {
      if (!e.target) return false;

      if (!(e.target instanceof HTMLElement) || !context.Block.find(e.target.id)) {
        console.warn("Input event target is not a valid block element.");
        e.preventDefault();
        return false;
      }

      return true;
    },
  };
}

export type InputAPI = ReturnType<typeof inputAPI>;
