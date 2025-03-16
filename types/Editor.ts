/**
 * The entire editor document.
 */
export type EditorDocument = {
  blocks: Block[];
};

/**
 * Input data for the editor, provided by the user.
 * Note that 'id' is not present here as it is generated by the editor.
 */
export type EditorContent = Omit<Block, "id">[];

/**
 * Block types currently supported by the editor.
 */
export type BlockType = "paragraph" | "heading";
type ExperimentalBlockType = "paragraph" | "heading-1" | "heading-2" | "heading-3"; // ...

/**
 * General structure of a block in the document.
 * T defines any additional properties (props) for a specific block type
 */
export type Block<T = Record<string, any>> = {
  /** block DOM id */
  id: `${string}-${string}-${string}-${string}-${string}`;
  /** type of render component */
  type: BlockType;
  /** text content of the block */
  nodes: InlineNode[];
  /** additional properties for the block */
  props: T;
};

/**
 * Specialized "paragraph" block (no extra properties).
 */
export type ParagraphBlock = Block<{}>;

/**
 * Specialized "heading" block.
 */
export type HeadingBlock = Block<{ level: number }>;

/**
 * Text node inside a block.
 * Each node can have `InlineStyle` enabled, which will be used to generate CSS styles.
 */
export type InlineNode = {
  /** text content */
  text: string;
} & Partial<Record<InlineStyle, boolean>>;

/**
 * All possible inline styles that can be set on a single text node.
 */
export type InlineStyle = "bold" | "italic" | "code" | "underline" | "strikethrough";

/**
 * Runtime node is used to identify a specific text node when editor is manipulating
 * it (e.g. selection), hence it has an `id`.
 */
export type NodeFragment = Omit<InlineNode, InlineStyle> & {
  /** node DOM id */
  id: `${Block['id']}/${number}`;
  /** text offset from the start of the node */
  offset: number;
};

/**
 * Union of all possible editor states.
 */
export type AnyEditorState = BlockState | ContentState;

export type EditorEventStateType = 'selection' | 'cursor';

/**
 * Union of all possible block states.
 */
type BlockState = SelectionState | CursorState;

type ContentState = SelectedNodesState | FocusedBlockState;

type EditorStateMap = {
  selection: SelectionState;
  cursor: CursorState;
}

export type EditorStateSchema = {
  [key in EditorEventStateType]: {
    get: () => EditorState<EditorStateMap[key]>;
    set: (state: EditorState<EditorStateMap[key]>) => void;
    clear: () => void;
  }
}

export type EditorStateHolder = {
  [key in EditorEventStateType]: EditorState<EditorStateMap[key]>;
}

/**
 * Type of the editor state. Needs to be extended with the specific editor state type.
 */
export type EditorState<T extends AnyEditorState> = {
  type: EditorEventStateType;
} & T | null;

/**
 * State of the editor when a selection is active inside a block.
 */
export type SelectionState = {
  type: 'selection';
  /** a block id where the selection is happening */
  block: Block['id'];
  /** selection start offset (absolute offset in the block) */
  start: number;
  /** selection end offset (absolute offset in the block) */
  end: number;
  /** nodes that are part of the selection */
  nodes: NodeFragment[];
};

/**
 * Information about the cursor position inside a block.
 */
export type CursorState = {
  type: "cursor";
  /** a block id where the cursor is */
  block: Block['id'];
  /** a node id where the cursor is */
  node: NodeFragment['id'];
  /** local offset inside the node */
  offset: number;
  /** absolute offset in the block */
  absolute: {start: number, end: number};
};

/**
 * State of the editor when nodes are selected.
 * NOT USING!!
 */
export type SelectedNodesState = {
    type: "selectedNodes";
    /** block id where the nodes are */
    block: string;
    /** nodes that are focused */
    node: InlineNode[];
    /** styles set that are applied to the nodes */
    styles: Record<InlineStyle, boolean>;
}

/**
 * State of the editor when a block is focused.
 * NOT USING!!
 */
export type FocusedBlockState = {
    /** block id that is focused */
    block: string;
}