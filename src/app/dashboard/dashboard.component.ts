/**
 * Dashboard Component for Traversal Application
 * 
 * The main dashboard component that serves as the central hub for the Traversal
 * map-based pin management system. It coordinates between the map component,
 * pin dialogs, and user interface controls.
 * 
 * Key Responsibilities:
 * - Managing map state (zoom, position, markers)
 * - Handling user interactions with pins and markers
 * - Controlling overlay displays and dialogs
 * - Coordinating communication between map and UI components
 * - Managing user session (logout functionality)
 * 
 * Features:
 * - Real-time map interaction tracking
 * - Pin creation and management dialogs
 * - Responsive overlay system
 * - Integration with HERE Maps API
 */

import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PinDialogComponent } from './pin-dialog/pin-dialog.component';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  // Application title (legacy from HERE Maps demo)
  title = 'here-maps';
  
  // Map state properties
  zoom: number;           // Current map zoom level
  lat: number;            // Current map latitude center
  lng: number;            // Current map longitude center
  
  // Pin and marker management
  markers: any[] = [];    // Array of all markers currently displayed on map
  
  // UI state management
  overlayOpen = false;       // Controls general overlay visibility
  pinOverlayOpen = false;    // Controls pin management overlay visibility
  
  // Component references
  @ViewChild('mapComponent') MapRef: MapComponent;  // Reference to map component
  
  // Search functionality (TODO: implement search features)
  searchOptions: any;
  
  /**
   * Constructor - Initialize dashboard with default map settings
   * 
   * @param router - Angular router for navigation
   * @param dialog - Material dialog service for opening pin dialogs
   */
  constructor(private router: Router, private dialog: MatDialog) {
    // Initialize map to show global view
    this.zoom = 5;    // Medium zoom level for global overview
    this.lat = 0;     // Equator latitude
    this.lng = 0;     // Prime meridian longitude
  }

  /**
   * User Authentication - Handle user logout
   * 
   * Navigates user back to the login page and clears session data.
   * TODO: Add proper session cleanup and token invalidation
   */
  logout(): void {
    console.log('🚪 User logging out from dashboard');
    this.router.navigate(['login']);
  }

  /**
   * Map Event Handler - Process map changes (zoom, pan, etc.)
   * 
   * This function is called whenever the user interacts with the map
   * (zooming, panning, etc.) and updates the dashboard state accordingly.
   * 
   * @param event - HERE Maps change event containing new map state
   */
  handleMapChange(event: H.map.ChangeEvent): void {
    // Check if the event contains look-at information (camera position)
    if (event.newValue.lookAt) {
      const lookAt = event.newValue.lookAt;
      
      // Update dashboard state with new map position
      this.zoom = lookAt.zoom;
      this.lat = lookAt.position.lat;
      this.lng = lookAt.position.lng;
      
      console.log('🗺️ Map position updated:', {
        zoom: this.zoom,
        lat: this.lat.toFixed(4),
        lng: this.lng.toFixed(4)
      });
    }
  }
  /**
   * Pin Dialog Management - Open pin information and editing dialog
   * 
   * Opens a Material Dialog component for viewing and editing pin information.
   * Handles the response when the dialog is closed, including pin deletion.
   * 
   * @param data - Pin data object containing information about the selected pin
   */
  openPinDialog(data: any): void {
    console.log('📍 Opening pin dialog for:', data.data?.id);
    
    // Open the pin dialog with specified width and pin data
    const dialogRef = this.dialog.open(PinDialogComponent, {
      width: '900px',
      data: { data: data.data },
    });

    // Handle dialog close events
    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('📍 Pin dialog closed with result:', result);
      
      // If user chose to delete the pin
      if (result) {
        const markerToDelete = this.markers.find(
          (mark) => data.data.id === mark.data.id
        );
        
        if (markerToDelete) {
          console.log('🗑️ Removing marker from map:', markerToDelete.data.id);
          this.MapRef.removeMarker(markerToDelete);
        }
      }
    });
  }

  /**
   * Map Click Handler - Process marker updates from map component
   * 
   * Called when the map component emits marker changes (new pins, updates, etc.).
   * Updates the dashboard's marker array to keep UI in sync with map state.
   * 
   * @param event - Array of marker objects from the map component
   */
  handleMapClick(event: any[]): void {
    console.log('🎯 Map click event received, markers count:', event.length);
    this.markers = event;
  }

  /**
   * Utility Function - Generate number range for UI iterations
   * 
   * Creates an array of numbers from 0 to n-1 for use in *ngFor directives
   * or other UI iteration needs.
   * 
   * @param n - The number of elements to generate (0 to n-1)
   * @returns Array of numbers [0, 1, 2, ..., n-1]
   */
  getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  /**
   * UI State Management - Toggle pin overlay visibility
   * 
   * Controls the visibility of the pin management overlay panel.
   * This overlay typically shows the list of saved pins and management options.
   */
  togglePinnedOverlay(): void {
    this.pinOverlayOpen = !this.pinOverlayOpen;
    console.log('📌 Pin overlay toggled:', this.pinOverlayOpen ? 'opened' : 'closed');
  }
}
