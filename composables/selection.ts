import type { NodeFragment } from "~/types";

export function selectionAPI(context: EditorContext) {
    return {
        trigger: (s: Selection) => {
          if (!context.Selection.validate(s)) return;
    
          const anchorNode = context.Node.find(s.anchorNode?.parentElement?.id as NodeFragment['id']);
          if (!anchorNode) return;
    
          const { start, end } = context.Selection.offsets(s, anchorNode);
          if (start === end) return;
    
          context.state.selection.set({
            type: "selection",
            block: anchorNode.block_id,
            start: start,
            end: end,
            nodes: [...context.Selection.nodes(s)],
          });
        },
        nodes: (s: Selection): NodeFragment[] => {
          const range = s.getRangeAt(0);
          const nodes: NodeFragment[] = [];
    
          if (s.anchorNode !== s.focusNode) {
            const fragment = range.cloneContents();
            const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
    
            let node;
            while ((node = walker.nextNode())) {
              const parentElement = node.parentElement;

              const isAnchor = parentElement?.id === s.anchorNode?.parentElement?.id;
              const isFocus = parentElement?.id === s.focusNode?.parentElement?.id;

              const anchorOffset = isAnchor ? s.anchorOffset : 0;
              const focusOffset = isFocus ? s.focusOffset : 0;

              if (parentElement) {
                nodes.push({
                  id: parentElement.id as NodeFragment['id'],
                  text: parentElement.textContent ?? "",
                  offset: context.Selection.direction(s) === 'forward' ? anchorOffset : focusOffset,
                });
              }
            }
          } else {
            if (s.anchorNode?.parentElement) {
              nodes.push({
                id: s.anchorNode?.parentElement.id as NodeFragment['id'],
                text: s.toString(),
                offset: context.Selection.direction(s) === 'forward' ? s.anchorOffset : s.focusOffset,
              });
            }
          }
    
          return nodes;
        },
        offsets: (s: Selection, node: NonNullable<NodeModel>): { start: number; end: number } => {
          let selectionAbsoluteOffset = 0;
          const direction = context.Selection.direction(s);
    
          node.siblings()?.forEach((sibling, index) => {
            if (index < node.index) {
              selectionAbsoluteOffset += sibling ? realTextLengthWithoutZWS(sibling.text) : 0;
            }
          });

          const anchorText = node.element()?.textContent ?? "";
    
          selectionAbsoluteOffset += realTextOffsetWithoutZWS(anchorText, s.anchorOffset);
    
          if (direction === "backward") {
            return {
              start: selectionAbsoluteOffset - realTextLengthWithoutZWS(s.toString()),
              end: selectionAbsoluteOffset,
            };
          } else if (direction === "forward") {
            return {
              start: selectionAbsoluteOffset,
              end: selectionAbsoluteOffset + realTextLengthWithoutZWS(s.toString()),
            };
          } else {
            return { start: 0, end: 0 };
          }
        },
        direction: (s: Selection): "forward" | "backward" => {
          const onSameNode = s.anchorNode === s.focusNode;
          const onPrecedingNode = s.focusNode
            ? s.anchorNode?.compareDocumentPosition(s.focusNode) === Node.DOCUMENT_POSITION_PRECEDING
            : false;
          const rangeBackwards = s.anchorOffset > s.focusOffset;
    
          return onSameNode
            ? rangeBackwards
              ? "backward"
              : "forward"
            : onPrecedingNode
              ? "backward"
              : "forward";
        },
        restore: async () => {
          const selection = context.state.selection.get();
          if (!selection) return;
    
          await nextTick();
    
          const block = context.Block.find(selection.block);
          if (!block) return;
    
          const { startNode, endNode, endOffset, startOffset } = context.Block.childrenInRange(
            block,
            selection.start,
            selection.end
          );
    
          const startChild = startNode?.element()?.firstChild;
          const endChild = endNode?.element()?.firstChild;
    
          // 3) Vytvořit Range
          if (startChild && endChild) {
            const s = window.getSelection();
            const r = document.createRange();
    
            r.setStart(startChild, startOffset);
            r.setEnd(endChild, endOffset);
    
            s?.removeAllRanges();
            s?.addRange(r);
          }
        },
        validate: (s: Selection): boolean => {
          const anchorNodeId = s.anchorNode?.parentElement?.id;
          const focusNodeId = s.focusNode?.parentElement?.id;
    
          /** Is the selection valid */
          if (!anchorNodeId || !focusNodeId) {
            // console.warn("Selection not defined");
            return false;
          }
    
          /** Does the selected nodes know by editor */
          if (
            !context.document.blocks.some(
              (block) => anchorNodeId.includes(block.id) && focusNodeId.includes(block.id)
            )
          ) {
            console.warn("Selection is not in the editor");
            return false;
          }
    
          /** Does focus & anchor part of the same block */
          if (!new RegExp(`^${anchorNodeId.split("/")[0]}/\\d+$`).test(focusNodeId)) {
            console.warn("Selection is not in the same block");
            return false;
          }
    
          return true;
        },
      };
}

export type SelectionAPI = ReturnType<typeof selectionAPI>;