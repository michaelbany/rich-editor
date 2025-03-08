import type {
  EditorAnyBlock,
  EditorBlockSchema,
  EditorBlockType,
  EditorContent,
  EditorDocumentData,
  EditorHeadingBlock,
  EditorParagraphBlock,
  EditorTextNode,
} from "~/types";

export function useEditor(rawContent: EditorContent = []) {
  const documentData = reactive<EditorDocumentData>({
    blocks: [],
  });

  documentData.blocks = _initBlocks();

  function _initBlocks(): EditorAnyBlock[] {
    return rawContent.map((block, index) => ({
      id: crypto.randomUUID(),
      type: block.type,
      content: block.content,
      props: block.props,
    }));
  }

  const selectedUnit = ref<{ id: string | undefined; text: string | null }[]>([]);
  const cursorPosition = ref<{ id: string | undefined; offset: number | undefined }>({
    id: undefined,
    offset: undefined,
  });

  const select = {
    clear: () => {
      selectedUnit.value = [];
    },
    validate: (item_id: string | undefined) => {
      if (!item_id) {
        return false;
      }

      if (!documentData.blocks.find((block) => block.id === item_id.split("/")[0])) {
        return false;
      }

      const [firstId, index] = selectedUnit.value[0]?.id?.split("/") || [null, null];
      if (!firstId) {
        return true;
      }

      const testIdRegex = new RegExp(`^${firstId}/\\d+$`);

      if (testIdRegex.test(item_id)) {
        return true;
      }

      // remove all ranges if validation fails
    //   window.getSelection()?.removeAllRanges();
    //   select.clear();

      return false;
    },
    capture: () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        select.clear();
        return; // No selection
      }

      if (!selection.toString()) {
        if (select.validate(selection.anchorNode?.parentElement?.id)) {
          cursorPosition.value = {
            id: selection.anchorNode?.parentElement?.id,
            offset: selection.anchorOffset,
          };
        } else {
          cursorPosition.value = { id: undefined, offset: undefined };
        }
      }

      const range = selection.getRangeAt(0);
      const nodesSelected: { id: string; text: string | null }[] = [];

      // -- Selecting Nodes
      if (selection.anchorNode !== selection.focusNode) {
        const fragment = range.cloneContents();
        const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT, null);

        let node;
        while ((node = walker.nextNode())) {
          const parentElement = node.parentElement;
          if (parentElement) {
            nodesSelected.push({
              id: parentElement.id,
              text: node.textContent,
            });
          }
        }
      } else {
        if (selection.anchorNode?.parentElement) {
          nodesSelected.push({
            id: selection.anchorNode.parentElement.id,
            text: selection.toString(),
          });
        }
      }

      select.sync(nodesSelected);
    },
    sync: (nodes: { id: string; text: string | null }[]) => {
      selectedUnit.value = nodes.filter((node) => select.validate(node.id));
    },
  };

  function mergeSameStyleNodes(content: any[]) {
    const result = [];
    for (const item of content) {
      if (!result.length) {
        result.push(item);
      } else {
        const prev: EditorTextNode = result[result.length - 1];
        // Porovnáme styly (bold, italic, popř. code/link atd.)
        const sameStyle = prev.bold === item.bold && prev.italic === item.italic;
        // + další vlastnosti, pokud je máš

        if (sameStyle) {
          // Sloučíme text do posledního
          result[result.length - 1] = {
            ...prev,
            text: prev.text + item.text,
          };
        } else {
          result.push(item);
        }
      }
    }
    return result;
  }

  const restyle = (style: "bold" | "italic") => {
    if (selectedUnit.value.length === 0) return;

    const [blockId] = selectedUnit.value[0].id?.split("/") || [null];
    if (!blockId) return;

    const blockIndex = documentData.blocks.findIndex((b) => b.id === blockId);
    if (blockIndex < 0) return;

    const block = documentData.blocks[blockIndex];
    let oldContent = [...block.content]; // kopie obsahu
    let newContent: EditorTextNode[][] = [];

    // when selected multiple and some already have the style we toggle all to true
    let someOfAffectedNodesHasTheStyle =
      selectedUnit.value.some((item) => {
        const nodeIndex = Number(item.id?.split("/")[1] ?? -1);
        return nodeIndex >= 0 && oldContent[nodeIndex]?.[style];
      }) &&
      !selectedUnit.value.every((item) => {
        const nodeIndex = Number(item.id?.split("/")[1] ?? -1);
        return nodeIndex >= 0 && oldContent[nodeIndex]?.[style];
      });

    for (const selectedItem of selectedUnit.value) {
      // Zjistíme index v contentu
      const nodeIndex = Number(selectedItem.id?.split("/")[1] ?? -1);
      if (nodeIndex < 0 || !oldContent[nodeIndex]) {
        // zde je chyba! Jednotlivými blocky upravujeme newContent a potom na něm zakládáme podmínku. Tato podmínka by se měla zachovávat podle "puvodního konententu"
        continue; // neplatný index
      }

      const originalNode = oldContent[nodeIndex];
      const selectedText = selectedItem.text ?? "";

      // pokud je to přesně jeden block stačí nám pouze upravit styly.
      if (selectedText.trim() === originalNode.text.trim()) {
        oldContent[nodeIndex] = {
          ...originalNode,
          [style]: someOfAffectedNodesHasTheStyle ? true : !originalNode[style],
        };
      } else {
        const fullText = originalNode.text;

        // Pokud je výběr prázdný, vracíme beze změny
        if (!selectedText.trim()) continue;

        // Najdeme, kde v původním textu se `selectedText` vyskytuje
        const startPos = fullText.indexOf(selectedText);
        if (startPos < 0) continue; // nenašlo substring -> nic neděláme

        const endPos = startPos + selectedText.length;

        const [prefix, middle, suffix] = [
          fullText.slice(0, startPos),
          fullText.slice(startPos, endPos),
          fullText.slice(endPos),
        ];

        // Převedení na nové nodes
        const prefixNode = prefix
          ? {
              ...originalNode,
              text: prefix,
            }
          : null;

        const middleNode = {
          ...originalNode,
          text: middle,
          [style]: someOfAffectedNodesHasTheStyle ? true : !originalNode[style],
        };

        const suffixNode = suffix
          ? {
              ...originalNode,
              text: suffix,
            }
          : null;

        const newNodes = [prefixNode, middleNode, suffixNode].filter(Boolean) as EditorTextNode[];

        newContent[nodeIndex] = newNodes;
      }
    }

    newContent.forEach((newNodes, index) => {
      /** @ts-ignore */
      oldContent[index] = newNodes;
    });

    oldContent = oldContent.flat();

    oldContent = mergeSameStyleNodes(oldContent);

    documentData.blocks[blockIndex] = {
      ...block,
      content: oldContent,
    };

    select.clear();
    window.getSelection()?.removeAllRanges();

    // #done - opravené rozdělování a přepínání stylů
    // #done - check mergeing
    // #todo - obnovení selectu po změně
    // #todo - posunutí kurzoru za nový text
    // #todo - opravit toggle, aby true vždy prvně přepsalo všechny false až potom naopak
  };

  //   function updateBlock(event: KeyboardEvent) {

  //   }

  return {
    get content(): EditorAnyBlock[] {
      return documentData.blocks;
    },
    select,
    restyle,
    state: {
      selectedUnit,
      cursorPosition,
    },
  };
}
