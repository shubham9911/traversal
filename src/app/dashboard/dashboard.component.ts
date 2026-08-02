import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { MapComponent } from "../map/map.component";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent {
  // Application title (legacy from HERE Maps demo)
  title = "here-maps";

  // Map state properties
  zoom: number; // Current map zoom level
  lat: number; // Current map latitude center
  lng: number; // Current map longitude center

  // Pin and marker management
  markers: any[] = []; // Array of all markers currently displayed on map

  // UI state management
  overlayOpen = false; // Controls general overlay visibility
  pinOverlayOpen = false; // Controls pin management overlay visibility

  // Component references
  @ViewChild("mapComponent") MapRef: MapComponent; // Reference to map component

  // Search functionality (TODO: implement search features)
  searchOptions: any;
  constructor(private router: Router) {
    this.zoom = 5;
    this.lat = 0;
    this.lng = 0;
  }

  /**
   * User Authentication - Handle user logout
   *
   * Navigates user back to the login page and clears session data.
   * TODO: Add proper session cleanup and token invalidation
   */
  logout(): void {
    console.log("🚪 User logging out from dashboard");
    this.router.navigate(["login"]);
  }
  handleMapChange(event: any) {
    // Leaflet map move/zoom — center and zoom tracked via @Input bindings
  }

  openPinDialog(data: any) {
    // Pin list overlay click — dialog is handled directly from MapComponent marker tap
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
    console.log("🎯 Map click event received, markers count:", event.length);
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
    console.log(
      "📌 Pin overlay toggled:",
      this.pinOverlayOpen ? "opened" : "closed"
    );
  }
}
