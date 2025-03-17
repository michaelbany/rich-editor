<script setup lang="ts">
  import { useForwardPropsEmits } from "radix-vue";
  import type { ExperimentalBlockEmits, ExperimentalBlockProps } from "~/types";

  const props = defineProps<ExperimentalBlockProps>();
  const emit = defineEmits<ExperimentalBlockEmits>();
  const forwarted = useForwardPropsEmits(props, emit);

  const editor = inject("editor") as ReturnType<typeof useEditor>;
  const block = editor.block.find(props.id) as NonNullable<BlockModel>;

  const cols = 2;

  function chunkArray(array: any[], size: number) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }
</script>
<template>
  <table v-bind="forwarted" class="mb-[0.5em] w-full border">
    <tr
      v-for="(row, rowIndex) in chunkArray(block.original().nodes, cols)"
      :key="rowIndex"
      class="border"
    >
      <td v-for="(node, colIndex) in row" :key="colIndex" class="border">
        <EditorTextNode :node="node" :id="props.id + '/' + rowIndex + '/' + colIndex" />
      </td>
    </tr>
  </table>
</template>
