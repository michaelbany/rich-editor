<script setup lang="ts">
  import type { EditorContent } from "~/types";

  const props = defineProps<{
    content: EditorContent;
  }>();

  const editor = useEditor2(props.content);

  onMounted(() => {
    editor.capture();
  });

  onUnmounted(() => {
    editor.destroy();
  });
</script>
<template>
  <!-- <UiButton @click="editor.restyle('bold')">Bold</UiButton> -->
  <!-- <UiButton @click="editor.restyle('italic')">Italic</UiButton> -->
  <div class="mb-12">
    <template v-for="block in editor.data.blocks">
      <EditorBlock :block="block" @input="() => console.log(editor.content)">
        <EditorTextNode v-for="(node, i) in block.nodes" :node="node" :id="block.id + '/' + i" />
      </EditorBlock>
    </template>
  </div>



  Cursor position:
  <pre>
    {{ editor.state.cursor.get() }}
  </pre>

  Selected state:
  <pre>
    {{ editor.state.selection.get() }}
  </pre>

  <!-- Selected unit:
  <pre>
      {{ editor.state.selectedUnit }}
  </pre>

  Editor content: {{ editor.content.length }} {{ editor.content.map((block) => block.content.length) }}
  <pre>
    {{ editor.content }}
  </pre> -->
</template>
