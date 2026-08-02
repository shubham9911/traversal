/**
 * Map Component for Traversal Application
 *
 * This is the core component that integrates HERE Maps API to provide interactive
 * mapping functionality for the Traversal application. It handles pin placement,
 * location search, marker management, and map interactions.
 *
 * Key Features:
 * - HERE Maps integration with custom pin icons
 * - Interactive pin placement via map clicks
 * - Reverse geocoding for address resolution
 * - Location search with autocomplete
 * - Local storage persistence for pins
 * - Pin editing and deletion dialogs
 * - Responsive map controls and behaviors
 *
 * Data Flow:
 * - User clicks map → reverse geocode → create pin → store locally
 * - User searches location → geocode → center map → show results
 * - User interacts with pins → open dialog → edit/delete options
 *
 * Storage:
 * - Pins are persisted in browser localStorage for user convenience
 * - Data structure: [latitude, longitude, geocoding_result]
 */

import {
  Component,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnInit,
  OnDestroy,
} from "@angular/core";
import * as L from "leaflet";
import { PinDialogComponent } from "../dashboard/pin-dialog/pin-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../general/confirm-dialog/confirm-dialog.component";
import { PinService, Pin } from "../core/services/pin.service";
import { HttpClient } from "@angular/common/http";

// Fix default marker icon broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "assets/location-pin.png",
  iconUrl: "assets/location-pin.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  shadowUrl: "",
});

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit, OnDestroy {
  private map?: L.Map;
  private markerMap = new Map<string, L.Marker>(); // pinId → marker

  @Input() public zoom = 4;
  @Input() public lat = 21.7679;
  @Input() public lng = 78.8718;

  @ViewChild("map") mapDiv?: ElementRef;
  private timeoutHandle: any;

  @Output() notify = new EventEmitter();

  /** Emits marker array updates to parent component */
  @Output() hitPoint = new EventEmitter();

  searchQuery: string = "";
  searchOptions: any[] = [];
  searchTimer: any;

  constructor(
    public dialog: MatDialog,
    private pinService: PinService,
    private http: HttpClient
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.map?.remove();
  }

  ngOnChanges(changes: SimpleChanges) {
    clearTimeout(this.timeoutHandle);
    this.timeoutHandle = setTimeout(() => {
      if (!this.map) return;
      if (changes["zoom"]) this.map.setZoom(changes["zoom"].currentValue);
      if (changes["lat"] || changes["lng"]) {
        this.map.setView([
          changes["lat"]?.currentValue ?? this.lat,
          changes["lng"]?.currentValue ?? this.lng,
        ]);
      }
    }, 100);
  }

  ngAfterViewInit(): void {
    if (this.map || !this.mapDiv) return;

    this.map = L.map(this.mapDiv.nativeElement, {
      center: [21.7679, 78.8718],
      zoom: 4,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    // Leaflet needs the container to be painted before it can measure size
    setTimeout(() => this.map?.invalidateSize(), 300);

    // Emit map move/zoom events
    this.map.on("moveend zoomend", () => this.notify.emit(this.map));

    // Tap to drop pin
    this.map.on("click", (e: L.LeafletMouseEvent) => {
      this.reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    // Load saved pins from API
    this.pinService.getAll().subscribe((pins) => {
      for (const pin of pins) this.placeMarker(pin);
    });
  }

  openDialog(pin: Pin, marker: L.Marker) {
    // Save current view before zooming in
    const previousCenter = this.map!.getCenter();
    const previousZoom = this.map!.getZoom();

    // Fly to pin at max zoom
    this.map!.flyTo([pin.lat, pin.lng], 18, { animate: true, duration: 0.8 });

    const dialogRef = this.dialog.open(PinDialogComponent, {
      width: "750px",
      data: { data: pin },
    });

    // Handle dialog result when user closes it
    dialogRef.afterClosed().subscribe((result: any) => {
      // Restore previous view on close
      this.map!.flyTo(previousCenter, previousZoom, {
        animate: true,
        duration: 0.8,
      });

      if (result?.delete) {
        this.pinService
          .delete(pin.id)
          .subscribe(() => this.removeMarker(pin.id, marker));
        return;
      }
      if (result?.info !== undefined) {
        this.pinService
          .update(pin.id, pin.title, result.info)
          .subscribe((updated) => {
            pin.note = updated.note;
          });
      }
    });
  }

  placeMarker(pin: Pin) {
    const icon = L.icon({
      iconUrl: "assets/location-pin.png",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    const marker = L.marker([pin.lat, pin.lng], { icon })
      .addTo(this.map!)
      .on("click", (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        this.openDialog(pin, marker);
      });

    this.markerMap.set(pin.id, marker);
    this.emitMarkers();
  }

  removeMarker(pinId: string, marker: L.Marker) {
    marker.remove();
    this.markerMap.delete(pinId);
    this.emitMarkers();
  }

  private emitMarkers() {
    this.hitPoint.emit(Array.from(this.markerMap.values()));
  }

  reverseGeocode(lat: number, lng: number) {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    this.http.get<any>(url).subscribe({
      next: (result) => {
        if (result?.display_name) {
          const title = result.display_name
            .split(",")
            .slice(0, 2)
            .join(",")
            .trim();
          const address = result.display_name;
          this.pinService
            .create(lat, lng, title, "", address)
            .subscribe((pin) => {
              this.placeMarker(pin);
            });
        } else {
          this.dialog.open(ConfirmDialogComponent);
        }
      },
      error: () => this.dialog.open(ConfirmDialogComponent),
    });
  }

  // Search via Nominatim
  fillSearchOptions(event: any) {
    const q = event.target.value;
    if (!q) {
      this.searchOptions = [];
      return;
    }
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&format=json&limit=5`;
      this.http.get<any[]>(url).subscribe((results) => {
        this.searchOptions = results;
      });
    }, 600);
  }

  searchLocation(result: any): void {
    if (!result) return;
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    this.map?.setView([lat, lon], 14);
    this.searchOptions = [];
  }
}
