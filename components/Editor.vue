<script setup lang="ts">
  import type { EditorContent } from "~/types";

  const props = defineProps<{
    content: EditorContent;
  }>();

  const editor = useEditor(props.content);

  onMounted(() => {
    document.addEventListener("selectionchange", editor.select.capture);
  });

  onUnmounted(() => {
    document.removeEventListener("selectionchange", editor.select.capture);
  });
</script>
<template>
  <UiButton @click="editor.restyle('bold')">Bold</UiButton>
  <UiButton @click="editor.restyle('italic')">Italic</UiButton>
  <div class="mb-12">
    <template v-for="block in editor.content">
      <EditorBlock :block="block" @input="() => console.log(editor.content)">
        <EditorTextNode v-for="(node, i) in block.content" :node="node" :id="block.id + '/' + i" />
      </EditorBlock>
    </template>
  </div>



  Cursor position:
  <pre>
    {{ editor.state.cursorPosition }}
  </pre>

  Selected unit:
  <pre>
      {{ editor.state.selectedUnit }}
  </pre>

  Editor content:
  <pre>
    {{ editor.content }}
  </pre>
</template>
