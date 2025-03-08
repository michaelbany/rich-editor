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

  const select = {
    clear: () => {
      selectedUnit.value = [];
    },
    validate: (item: { id: string; text: string | null }) => {
      if (!documentData.blocks.find((block) => block.id === item.id.split("/")[0])) {
        return false;
      }

      const [firstId, index] = selectedUnit.value[0]?.id?.split("/") || [null, null];
      if (!firstId) {
        return true;
      }

      const testIdRegex = new RegExp(`^${firstId}/\\d+$`);

      if (testIdRegex.test(item.id)) {
        return true;
      }

      // remove all ranges if validation fails
      window.getSelection()?.removeAllRanges();
      select.clear();

      return false;
    },
    capture: () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !selection.toString()) {
        select.clear();
        return; // No selection
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
    sync: (nodes: any[]) => {
      selectedUnit.value = nodes.filter((node) => select.validate(node));
    },
  };

  function splitAndToggle(
    content: any[],
    nodeIndex: number,
    selectedText: string,
    style: "bold" | "italic"
  ) {
    const node = content[nodeIndex];
    const fullText = node.text;
    if (!selectedText.trim()) {
      // Pokud je výběr prázdný, vracíme beze změny
      return content;
    }

    // Najdeme, kde v původním textu se `selectedText` vyskytuje
    const startPos = fullText.indexOf(selectedText);
    if (startPos < 0) {
      // nenašlo substring -> nic neděláme
      return content;
    }

    const endPos = startPos + selectedText.length;
    const prefix = fullText.slice(0, startPos);
    const middle = fullText.slice(startPos, endPos);
    const suffix = fullText.slice(endPos);

    // Node pro prefix (zachová původní styl)
    const prefixNode = prefix
      ? {
          ...node,
          text: prefix,
        }
      : null;

    // Node pro vybraný střed (přepneme styl)
    const middleNode = {
      ...node,
      text: middle,
      [style]: !node[style],
    };

    // Node pro suffix
    const suffixNode = suffix
      ? {
          ...node,
          text: suffix,
        }
      : null;

    // Sestavíme nové části
    const newNodes = [prefixNode, middleNode, suffixNode].filter(Boolean);

    // Nahradíme 1 node za X nových
    return [...content.slice(0, nodeIndex), ...newNodes, ...content.slice(nodeIndex + 1)];
  }

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

      console.log(someOfAffectedNodesHasTheStyle);

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

    // console.log(newContent);
    //   newContent = mergeSameStyleNodes(newContent);

    documentData.blocks[blockIndex] = {
      ...block,
      content: oldContent,
    };

    //   select.clear();
    // #done - opravené rozdělování a přepínání stylů
    // #todo - check mergeing
    // #todo - obnovení selectu po změně
    // #todo - posunutí kurzoru za nový text
    // #todo - opravit toggle, aby true vždy prvně přepsalo všechny false až potom naopak
  };

  return {
    get content(): EditorAnyBlock[] {
      return documentData.blocks;
    },
    select,
    restyle,
    state: {
      selectedUnit,
    },
  };
}
