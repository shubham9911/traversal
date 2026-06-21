/**
 * General Module for Traversal Application
 * 
 * This module contains shared/general purpose components that are used
 * across different parts of the Traversal application. It helps organize
 * reusable UI components and prevents code duplication.
 * 
 * Components included:
 * - ConfirmDialogComponent: Generic confirmation dialogs
 * - Other shared components as the app grows
 * 
 * Dependencies:
 * - Angular Material components for consistent UI
 * - Common module for basic Angular directives
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,              // Basic Angular directives (ngIf, ngFor, etc.)
    MaterialModule,           // Angular Material components
    ConfirmDialogComponent   // Confirmation dialog component
  ],
})
export class GeneralModule {}
