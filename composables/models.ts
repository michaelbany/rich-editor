import type { Block, InlineNode, InlineStyle } from "~/types";

export function modelAPI(context: EditorContext) {
  return {
    block: (id?: string) => createBlock(context, id),
    node: (id?: string) => createNode(context, id),
  };
}

/**
 * The function to create runtime BlockModel.
 * @param id DOM id of the block
 * @returns BlockModel
 */
function createBlock(context: EditorContext, id?: string) {
  if (!id) return undefined;

  const self = context.document.blocks.find((block) => block.id === id) as Block;
  if (!self) return undefined;

  return {
    id: id,
    type: self.type,
    index: context.document.blocks.findIndex((block) => block.id === id),
    /** @returns Block */
    original(): Block {
      return self;
    },
    /** @returns DOM element */
    element(): HTMLElement | null {
      return document.getElementById(id);
    },
    /** @returns DOM element[] could return HTMLElement instead */
    children(): HTMLElement[] {
      return Array.from(this.element()?.children ?? []).filter(
        (child): child is HTMLElement => child.nodeType === Node.ELEMENT_NODE
      );
    },
    /** @returns NodeModel[] */
    nodes(): NonNullable<NodeModel>[] {
      return Array.from(self.nodes)
        .map((node, index) => createNode(context, `${id}/${index}`))
        .filter((node) => node !== undefined);
    },
    /** @returns full text of the block */
    text(): string {
      return (
        this.nodes()
          .map((node) => node?.text)
          .join("") ?? ""
      );
    },
  };
}

/**
 * The function to create runtime NodeModel.
 * @param id DOM id of the node
 * @returns NodeModel
 */
function createNode(context: EditorContext, id?: string) {
  if (!id) return undefined;

  const self = context.document.blocks.find((block) => id?.includes(block.id))?.nodes?.[
    Number(id?.split("/")[1]) ?? "-1"
  ] as InlineNode;

  if (!self) return undefined;

  return {
    id: id,
    text: self.text,
    block_id: id.split("/")[0],
    index: Number(id.split("/")[1]) ?? -1,
    style: Object.keys(self).filter((key) => key !== "text") as InlineStyle[],
    setStyle(style: InlineStyle, force?: boolean) {
      if (!this.style.includes(style)) {
        this.style.push(style);
      } else if (!force) {
        this.style = this.style.filter((s) => s !== style);
      }
    },
    /** @returns InlineNode */
    original(): InlineNode {
      return {
        text: this.text,
        ...this.style.reduce((acc: Partial<Record<InlineStyle, boolean>>, style: InlineStyle) => {
          acc[style] = true;
          return acc;
        }, {}),
      };
    },
    /** @returns DOM element */
    element(): HTMLElement | null {
      return document.getElementById(id);
    },
    /** @returns DOM element */
    parent(): HTMLElement | null {
      return document.getElementById(id.split("/")[0]);
    },
    /** @returns BlockModel */
    block() {
      return createBlock(context, id.split("/")[0]);
    },
    /** @returns NodeModel[] */
    siblings() {
      return this.block()?.nodes();
    },
  };
}

export type NodeModel = ReturnType<typeof createNode>;
export type BlockModel = ReturnType<typeof createBlock>;
