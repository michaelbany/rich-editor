<script setup lang="ts">
  import type { EditorContent } from "~/types";

  useHead({
    title: "Editor",
  });

  const content: EditorContent = [
    {
      type: "heading",
      nodes: [
        {
          text: "Heading 1",
        },
      ],
      props: { level: 2 },
    },
    {
      type: "paragraph",
      nodes: [
        {
          text: "This is a paragraph with ",
        },
        {
          text: "italic",
          italic: true,
        },
        {
          text: " and ",
        },
        {
          text: "bold",
          bold: true,
        },
        {
          text: " text.",
        },
      ],
      props: {},
    },
    {
      type: "paragraph",
      nodes: [
        {
          text: "",
        }
      ]
    },
    {
      type: "paragraph",
      nodes: [
        {
          text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Quisque tincidunt scelerisque libero. Etiam posuere lacus quis dolor. Etiam commodo dui eget wisi. Integer pellentesque quam vel velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Fusce dui leo, imperdiet in, aliquam sit amet, feugiat eu, orci. Mauris elementum mauris vitae tortor. Vivamus luctus egestas leo. Sed elit dui, pellentesque a, faucibus vel, interdum nec, diam. Donec iaculis gravida nulla. Nullam justo enim, consectetuer nec, ullamcorper ac, vestibulum in, elit. In rutrum. Sed ac dolor sit amet purus malesuada congue. Aliquam erat volutpat. Praesent in mauris eu tortor porttitor accumsan."
        }
      ]
    }
  ];

  // const editor = useEditor(content)

  /**
   * How SUPER DESCRIPTION
   * Basic text transformation - bold, italic, code, link
   * Components pro jednotlivé typy textu - Headings, Paragraph, Code, Callout, List
   */
</script>
<template>
    <NuxtLayout>
        <Editor :content="content" />
    </NuxtLayout>
</template>
