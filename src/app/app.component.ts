/**
 * Root App Component for Traversal Application
 * 
 * This is the main application component that serves as the entry point
 * for the Traversal web application. It acts as the container for all
 * other components and handles the overall application structure.
 * 
 * The Traversal app is a map-based pin management system that allows
 * users to place, manage, and interact with location pins on HERE Maps.
 */

import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  // Application title - displayed in browser tab and header
  title = 'Traversal';
}
