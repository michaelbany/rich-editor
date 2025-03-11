import type { EditorDocument, EditorStateSchema } from "~/types";

export type EditorContext = {
    document: EditorDocument;
    state: EditorStateSchema;
    Selection: SelectionAPI;
    Cursor: CursorAPI;
    Block: BlockAPI;
    Node: NodeAPI;
    model: {
        block: (id?: string) => BlockModel;
        node: (id?: string) => NodeModel;
    }
}

export function modules(partialContext: Partial<EditorContext>) {

    const context: Partial<EditorContext> = partialContext;

    const Selection = selectionAPI(context as EditorContext);
    const Cursor = cursorAPI(context as EditorContext);
    const Block = blockAPI(context as EditorContext);
    const Node = nodeAPI(context as EditorContext);

    const model = modelAPI(context as EditorContext);


    context.Selection = Selection;
    context.Cursor = Cursor;
    context.Block = Block;
    context.Node = Node;
    context.model = model;

    return context as EditorContext;
}