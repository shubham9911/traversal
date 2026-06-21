/**
 * Pin Dialog Component for Traversal Application
 * 
 * This component provides a rich text editor dialog for creating and editing
 * notes associated with map pins. Users can document their travel experiences,
 * thoughts, or any information related to specific locations.
 * 
 * Key Features:
 * - Rich text editor with formatting options (bold, italic, headers, etc.)
 * - Color and alignment controls
 * - List and quote formatting
 * - Save and delete functionality
 * - Integration with pin data storage
 * 
 * The component uses ngx-editor for rich text editing capabilities and
 * Angular Material Dialog for the modal interface.
 */

import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  Inject,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Validators, Editor, Toolbar } from 'ngx-editor';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-pin-dialog',
  templateUrl: './pin-dialog.component.html',
  styleUrls: ['./pin-dialog.component.scss'],
})
export class PinDialogComponent implements OnInit, OnDestroy {
  
  /**
   * Default Editor Document Structure
   * 
   * Defines the initial content structure for the rich text editor.
   * Creates a heading with placeholder text to guide users.
   */
  editorDoc = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: {
          level: 1,
          align: null,
        },
        content: [
          {
            type: 'text',
            text: 'Write something about your adventures....',
          },
        ],
      },
    ],
  };

  /**
   * Rich Text Editor Instance
   * 
   * The main editor instance provided by ngx-editor.
   * Handles all rich text editing functionality.
   */
  editor: Editor = new Editor();

  /**
   * Editor Toolbar Configuration
   * 
   * Defines the toolbar layout and available formatting options.
   * Organized in groups for better user experience:
   * - Basic formatting (bold, italic)
   * - Text decoration (underline, strikethrough)
   * - Content blocks (quotes, lists)
   * - Headers (h1-h6)
   * - Colors and alignment
   */
  toolbar: Toolbar = [
    ['bold', 'italic'],                    // Basic text formatting
    ['underline', 'strike'],               // Text decoration
    ['blockquote'],                        // Quote blocks
    ['ordered_list', 'bullet_list'],       // Lists
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }], // Headers
    ['text_color', 'background_color'],    // Color options
    ['align_left', 'align_center', 'align_right', 'align_justify'], // Alignment
  ];

  /**
   * Form Group for Editor Content
   * 
   * Angular reactive form to manage the editor content with validation.
   * Ensures that users provide some content before saving.
   */
  form = new FormGroup({
    editorContent: new FormControl(
      { value: this.editorDoc, disabled: false },
      Validators.required()
    ),
  });

  /**
   * Constructor - Initialize dialog with data and editor
   * 
   * @param dialogRef - Reference to the Material Dialog for closing/communication
   * @param dialogData - Data passed to the dialog (pin information)
   */
  constructor(
    public dialogRef: MatDialogRef<PinDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {
    this.editor = new Editor();
    console.log('📝 Pin dialog initialized with data:', dialogData);
  }
  /**
   * Component Initialization
   * 
   * Called after component construction. Loads existing pin note data
   * if available, or initializes a fresh editor instance.
   */
  ngOnInit(): void {
    // Check if the pin already has notes/content
    if (this.dialogData.data.note) {
      console.log('📖 Loading existing pin note content');
      this.form.get('editorContent')?.patchValue(this.dialogData.data.note);
    } else {
      console.log('📝 Initializing new pin note editor');
      this.editor = new Editor();
    }
  }

  /**
   * Component Cleanup
   * 
   * Called when component is destroyed. Properly disposes of the editor
   * instance to prevent memory leaks.
   */
  ngOnDestroy(): void {
    console.log('🧹 Cleaning up pin dialog editor');
    this.editor.destroy();
  }

  /**
   * Delete Pin Action
   * 
   * Closes the dialog and signals that the pin should be deleted.
   * The parent component will handle the actual deletion logic.
   */
  delete(): void {
    console.log('🗑️ User requested pin deletion');
    this.dialogRef.close({ delete: true });
  }

  /**
   * Save Pin Information
   * 
   * Saves the editor content as the pin's note and closes the dialog.
   * The content is passed back to the parent component for storage.
   */
  savePinInfo(): void {
    const content = this.form.get('editorContent')?.value;
    console.log('💾 Saving pin information:', { contentLength: JSON.stringify(content).length });
    
    this.dialogRef.close({ info: content });
  }
}
