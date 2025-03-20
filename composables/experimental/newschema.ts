/**
 * Define the schema for the editor and it's behavior
 * @returns Schema object
 */
const defineEditorComponents = () => ({
  paragraph: {
    leaf: true,
    component: "Paragraph",
  },
  "heading-1": {
    leaf: true,
    component: "Heading1",
  },
  "table-cell": {
    leaf: true,
    component: "TableCell",
  },
  "table-row": {
    leaf: false,
    component: "TableRow",
  },
  table: {
    leaf: false,
    component: "Table",
    onSomething: () => {
      // rewrite default
    },
  },
});

/** struktura pro content editoru s touto strukturou */
const content = [
  {
    type: "table",
    content: [
      {
        type: "table-row",
        content: [
          {
            type: "table-cell",
            content: [
              {
                text: "Hello ",
                bold: true,
              },
              {
                text: "World",
                italic: true,
              },
            ],
          },
        ],
      },
    ],
  },
];
