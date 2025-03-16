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
        case "deleteWordBackward":
          e.preventDefault();
          context.Input.delete(e, "backward");
          // #todo
          break;
        case "deleteSoftLineBackward":
          e.preventDefault();
          context.Input.delete(e, "backward");
          // #todo
          break;
        case "formatBold":
          e.preventDefault();
          context.Node.style("bold");
          break;
        case "formatItalic":
          e.preventDefault();
          context.Node.style("italic");
          break;
        case "formatUnderline":
          e.preventDefault();
          context.Node.style("underline");
          break;
        case "insertLineBreak":
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
       * - deleteSoftLineBackward (Shift + Backspace)
       * - insertLineBreak (Shift + Enter)
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

      // If cursor is at the start of the block
      if (cursor.absolute.start === 0 && direction === "backward") {
        if (block.text().length === 0) {
          context.Block.remove(block);
        } else {
          // put content to previous block and remove this block
          context.Block.merge(block, block.previous());
        }
        return;
      }

      // If cursor is at the end of the block
      if (cursor.absolute.end === 0 && direction === "forward") {
        context.Block.merge(block.next(), block);
        return;
      }

      const node = context.Node.find(cursor.node) as NonNullable<NodeModel>;

      const start = direction === "backward" ? cursor.offset - 1 : cursor.offset;
      const end = direction === "backward" ? cursor.offset : cursor.offset + 1;

      const text = node.text.slice(0, start) + node.text.slice(end);

      node.setText(text);

      context.document.blocks[block.index].nodes[node.index].text = node.text;

      if (node.text.length === 0) {
        context.Node.remove(node);
      }

      context.Cursor.move(block, cursor.absolute.start + (direction === "backward" ? -1 : 0));
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
        return false;
      }

      return true;
    },
  };
}

export type InputAPI = ReturnType<typeof inputAPI>;
