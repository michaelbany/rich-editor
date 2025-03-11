# Vue Rich Text Editor

Own notion-like rich text editor based Vue.


> still in development

- **Changing block text-node styles**
    - [x] Splitting block text-node
    - [x] Merging block text-node with same styles
    - [x] Applying text-node styles
    - [x] Re-applying selection after changing styles
    - [x] Cursor position persists after changing styles
    - [x] Sync JSON content with typing
    - [x] Cursor persistence after @input
    - [x] Ensure user cannot type outside text-node (span)
    - [x] Bold, italic by keyboard shortcut
    - [ ] Handle different type of input
        - [ ] Backspace - ensure min 1 span presists
        - [ ] Delete - ensure min 1 span presists
        - [ ] Arrow keys (left, right) move cursor in block (up, down) move cursor to next block if is on the edge
        - [ ] Enter create new block
        - [ ] Select and do action (delete or write)


Note:
- if editor works with like no styled text is't in a span, that would be easier to handle deleting, but harder to handle cursor position and styles.