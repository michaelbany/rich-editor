export type EditorDocumentData = {
    blocks: EditorAnyBlock[];
  };
  
  export type EditorBlockType = "paragraph" | "heading" | "list-item" | "callout" | "code";
  
  export type EditorTextNode = {
    text: string;
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    link?: string; // URL odkazu
  };
  
  type EditorBlock<T = Record<string, any>> = {
    id: string;
    type: EditorBlockType;
    content: EditorTextNode[];
    props: T;
  };
  
  export type EditorContent = Omit<EditorBlock, 'id'>[];
  
  // Odstavec (paragraph) – nemá žádné extra vlastnosti
  export type EditorParagraphBlock = EditorBlock<{}>;
  
  // Nadpis (heading) – obsahuje úroveň nadpisu
  export type EditorHeadingBlock = EditorBlock<{ level: number }>;
  
  // Položka seznamu (list-item) – definuje typ seznamu a úroveň vnoření
  export type EditorListItemBlock = EditorBlock<{ listType: "ordered" | "unordered"; level: number }>;
  
  // Callout – speciální zvýrazněný blok s ikonou
  export type EditorCalloutBlock = EditorBlock<{ icon?: string }>;
  
  // Code Block – umožňuje definovat jazyk pro syntax highlighting
  export type EditorCodeBlock = EditorBlock<{ language: string }>;
  
  // General Block – reprezentuje libovolný blok
  export type EditorAnyBlock = EditorParagraphBlock | EditorHeadingBlock | EditorListItemBlock | EditorCalloutBlock | EditorCodeBlock;
  
  export type EditorBlockSchema<T> = {
      defaultProps: T;
      convertTo: (props: T) => Partial<Record<EditorBlockType, any>>;
    };