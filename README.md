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
        - [x] Backspace - ensure min 1 span presists
        - [x] Delete - ensure min 1 span presists
        - [x] Arrow keys (left, right) move cursor in block (up, down) move cursor to next block
        - [ ] Up and down arrow keys move in same block if has more lines. If not, move to next block
        - [x] Enter create new block
        - [ ] If there is a text after cursor, split text-node and move to new block (Enter)
        - [ ] Select and do action (delete or write)
        - [ ] Deleting multiple words with backspace + ctrl (meta) (deleteSoftLineBackward)


- **Bugs spotted**
    - [ ] When writing more than 1 character, cursor moves only after 1st character
    - [ ] When jupming to next block with arrow up/down, cursor moves to same index in the next block as in the previous block, but it makes no sense if the next block has more than 1 line. It should then move to last line and there to the same index as in the previous block.