import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  title = 'here-maps';
  zoom: number;
  lat: number;
  lng: number;
  markers: any[] = [];
  overlayOpen = false;
  pinOverlayOpen = false;
  @ViewChild('mapComponent') MapRef: MapComponent;
  searchOptions: any;
  constructor(private router: Router) {
    this.zoom = 5;
    this.lat = 0;
    this.lng = 0;
  }

  logout() {
    this.router.navigate(['login']);
  }
  handleMapChange(event: any) {
    // Leaflet map move/zoom — center and zoom tracked via @Input bindings
  }

  openPinDialog(data: any) {
    // Pin list overlay click — dialog is handled directly from MapComponent marker tap
  }
  handleMapClick(event: any[]) {
    console.log(999, event);
    this.markers = event;
  }
  getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
  togglePinnedOverlay() {
    this.pinOverlayOpen = !this.pinOverlayOpen;
  }
}
