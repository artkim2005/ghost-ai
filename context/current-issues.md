Review the editor workspace implementation and fix the following issues. Check `components/editor` first. Do not break existing features.

## Issues

### 1. Save Button in Workspace Navbar [PENDING TEST]

Read the navbar component and the autosave hook before implementing.

The workspace navbar is missing a Save button. The autosave hook already exists and tracks saving/saved/error states, so wire the button to it.

Add the Save button to the workspace navbar only. The navbar is shared with the editor home so conditionally render the button based on workspace context - it must not appear on the editor home navbar.

Button behavior:

- default state: shows "Save"
- while saving: shows "Saving..."
- after successful save: shows "Saved" briefly then returns to "Save"
- on error: shows "Error" briefly then returns to "Save"
- clicking it triggers a manual save through the same save function the autosave hook uses

### 2. Auto Zoom on First Node Drop

Read Liveblocks agent skills before implementing this.

Dropping the first node onto a fully empty canvas causes an automatic zoom in. Check the drop handler and any fitView or fitBounds calls that may be triggered after the first node is added. Disable or guard any automatic fit/zoom behavior so it does not fire during a drop event. The viewport should stay exactly where the user left it after dropping a node.

### 3. Remove UserButton from Workspace Navbar

Check Clerk agent skills before implementing this.

Remove the UserButton from the workspace navbar only. The navbar is shared so make sure the UserButton remains on the editor home navbar. Conditionally render it based on whether the component is being used in the workspace context or the editor home context.

### 4. Save Error on Collaborator Canvas

When a collaborator saves or autosaves, the save button shows "Error". However, when the owner saves or autosaves, the save button shows that the canvas has been saved successfully. Ensure that the canvas actually saves to the vercel blob regardless of who saves it and that the button shows "Saved" for all users when a successful save occurrs.

### 5. Drag and Drop Position Offset

Read Liveblocks agent skills before implementing this.

When dropping a shape from the shape toolbar onto the canvas, the node is placed at the bottom right of the cursor. Check the drop handler in the canvas wrapper. The position calculation must account for:

- the drag offset from where the user grabbed the shape inside the drag element, not just the element's top left corner
- the canvas container's bounding rect
- the current React Flow pan offset and zoom scale via screenToFlowPosition or project

The node should appear with its center at the exact cursor position on drop.

### 6. Editing Multi-line Text in Nodes is Glitchy

When editing text inside a node that extends to multiple lines, the text condenses into a single line and a white box appears to the right that should not be there. When editing text, it should appear exactly how it does when it is not being edited; multiple lines should not condense into a single line.

### 7. Highlighting Text in Nodes Drags the Node

When highlighting text in nodes by dragging over it, the node gets dragged too. The node should stay in place while text is being dragged over when editing.

### 8. Collaborator cannot reach Ghost AI

When a collaborator sends a prompt to the AI in the architect tab, it says "Failed to reach Ghost AI. Please try again." However, it works when the owner sends a prompt. Analyze and fix this issue.

### 9. Template Initial Placement

Every time a template is imported, it is placed at the center of the canvas. Modify this behavior so that the template is placed where the user is currently panned to on the canvas.

### 10. Importing Multiple Templates Causes Unintended Behavior

When a template exists on the canvas and another different template is imported, the arrows from the initial template disappear. Additionally, if the same template is imported twice, it deletes the old version from the canvas and only keeps the new one. Fix this behavior.
