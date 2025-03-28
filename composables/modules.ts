import type { Block, EditorDocument, EditorStateSchema, NodeFragment } from "~/types";

export type EditorContext = {
    document: EditorDocument;
    state: EditorStateSchema;
    Selection: SelectionAPI;
    Cursor: CursorAPI;
    Input: InputAPI;
    KeyDown: KeydownAPI;
    Block: BlockAPI;
    Node: NodeAPI;
    model: {
        block: (id?: Block['id']) => BlockModel;
        node: (id?: NodeFragment['id']) => NodeModel;
    },
}

export function modules(partialContext: Partial<EditorContext>) {

    const context: Partial<EditorContext> = partialContext;

    const Selection = selectionAPI(context as EditorContext);
    const Cursor = cursorAPI(context as EditorContext);
    const Input = inputAPI(context as EditorContext);
    const KeyDown = keydownAPI(context as EditorContext);
    const Block = blockAPI(context as EditorContext);
    const Node = nodeAPI(context as EditorContext);

    const model = modelAPI(context as EditorContext);

    context.Selection = Selection;
    context.Cursor = Cursor;
    context.Input = Input;
    context.KeyDown = KeyDown;
    context.Block = Block;
    context.Node = Node;
    context.model = model;

    return context as EditorContext;
}