<script setup lang="ts">
  import type { Block, EditorState, InlineStyle, SelectionState } from "~/types";

  const props = defineProps<{
    selection: EditorState<SelectionState>;
    block: Block;
    editor: EditorReturn;
  }>();

  const open = ref(false);
  const selectionIsComplete = ref(false);
  const x = ref(0);
  const y = ref(0);

  const { y: mouseY } = useMouse();

  watch(() => mouseY.value, (oldValue, newValue) => {
    if (selectionIsComplete.value && !open.value) {
      if (newValue.valueOf() - oldValue.valueOf() > 1) {
        handleOpen();
      }
    } else if (open.value) {
      if (oldValue.valueOf() - newValue.valueOf() > 10) {
        open.value = false;
      }
    }
  })

  watchDebounced(
    () => props.selection,
    () => {
      if (props.selection) {
        selectionIsComplete.value = true;
      } else {
        selectionIsComplete.value = false;
      }
    },
    { debounce: 800 }
  );

  function computedSelectionPosition() {
    const selection = window.getSelection();
    if (!selection) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    x.value = rect.left + rect.width / 2 + window.scrollX;
    y.value = rect.top + window.scrollY;
  }

  function handleOpen() {
    if (props.selection && props.selection.block === props.block.id) {
      computedSelectionPosition();
      open.value = true;
    } else {
      open.value = false;
    }
  }

  function isSomeAlreadyStyled(style: InlineStyle) {
    const selection = props.editor.state.selection.get();
    if (!selection) return;

    const nodes = props.editor.node.collect(selection.nodes.map((node) => node.id));
    return nodes.some((node) => node.style.includes(style)) ? 'text-blue-500' : '';
  }
</script>
<template>
  <UiDropdownMenu v-model:open="open" :modal="false">
    <UiDropdownMenuTrigger class="absolute" :style="{ top: `${y}px`, left: `${x}px` }" />
    <UiDropdownMenuContent side="top" align="center" class="my-3 flex w-max flex-row">
      <UiDropdownMenuSub>
        <UiDropdownMenuSubTrigger title="Turn into" />
        <UiDropdownMenuSubContent align="center">
          <UiDropdownMenuItem title="Paragraph" icon="lucide:text" />
          <UiDropdownMenuItem title="Heading 1" icon="lucide:heading-1" />
          <UiDropdownMenuItem title="Heading 2" icon="lucide:heading-2" />
          <UiDropdownMenuItem title="Heading 3" icon="lucide:heading-3" />
        </UiDropdownMenuSubContent>
      </UiDropdownMenuSub>
      <UiDropdownMenuSeparator class="-my-1 mx-1 h-auto w-px bg-border" />
      <UiDropdownMenuItem icon="lucide:bold" @select.prevent="editor.node.style('bold')" :class="isSomeAlreadyStyled('bold')" />
      <UiDropdownMenuItem icon="lucide:italic" @select.prevent="editor.node.style('italic')" :class="isSomeAlreadyStyled('italic')" />
      <UiDropdownMenuItem icon="lucide:underline" @select.press="editor.node.style('underline')" :class="isSomeAlreadyStyled('underline')" />
      <UiDropdownMenuItem icon="lucide:strikethrough" @select.prevent="editor.node.style('strikethrough')" :class="isSomeAlreadyStyled('strikethrough')" />
      <UiDropdownMenuItem icon="lucide:code" @select.prevent="editor.node.style('code')" :class="isSomeAlreadyStyled('code')" />
    </UiDropdownMenuContent>
  </UiDropdownMenu>
</template>
