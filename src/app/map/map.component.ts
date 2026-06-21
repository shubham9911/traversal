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
} from "@angular/core";
import * as H from "@here/maps-api-for-javascript";
import { PinDialogComponent } from "../dashboard/pin-dialog/pin-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "../general/confirm-dialog/confirm-dialog.component";
import { PinService, Pin } from "../core/services/pin.service";

interface GeocodeResult {
  items: { position: H.geo.Point }[];
}

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit {
  private map?: any;
  
  /**
   * HERE Maps Platform instance - provides API services
   * Used for geocoding, search, and other HERE services
   */
  private platform: any;
  
  // ==================== INPUT PROPERTIES ====================
  
  /** Current map zoom level (controlled by parent component) */
  @Input() public zoom = 2;
  
  /** Current map center latitude (controlled by parent component) */
  @Input() public lat = 0;
  
  /** Current map center longitude (controlled by parent component) */
  @Input() public lng = 0;
  
  // ==================== STATE MANAGEMENT ====================
  
  /** Flag to prevent duplicate marker creation during async operations */
  isMarker: boolean = false;
  
  /** Array of all active markers currently displayed on the map */
  markers: any[] = [];
  @ViewChild("map") mapDiv?: ElementRef;
  private timeoutHandle: any;
  
  /** Timer for debouncing search input */
  searchTimer: any;
  
  // ==================== TEMPLATE REFERENCES ====================
  
  /** Reference to the HTML div element that contains the map */
  @ViewChild('map') mapDiv?: ElementRef;
  
  // ==================== EVENT EMITTERS ====================
  
  /** Emits map view changes to parent component (zoom, pan, etc.) */
  @Output() notify = new EventEmitter();
  
  /** Emits marker array updates to parent component */
  @Output() hitPoint = new EventEmitter();
  searchQuery: string = "";
  searchOptions: any[] = [];
  
  /**
   * Constructor - Initialize component with required services
   * 
   * @param dialog - Material Dialog service for opening pin dialogs
   */
  constructor(public dialog: MatDialog) {
    console.log('🗺️ Map component initialized');
  }

  constructor(public dialog: MatDialog, private pinService: PinService) {}

  ngOnInit() {}

  openDialog(pin: Pin, marker?: any) {
    const dialogRef = this.dialog.open(PinDialogComponent, {
      width: "750px",
      data: { data: pin },
    });

    // Handle dialog result when user closes it
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.delete) {
        this.pinService.delete(pin.id).subscribe(() => this.removeMarker(marker));
      }

      if (result?.info !== undefined) {
        this.pinService.update(pin.id, pin.title, result.info).subscribe((updated) => {
          pin.note = updated.note;
        });
      }
      
      // Reset marker flag to allow new marker creation
      this.isMarker = false;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    clearTimeout(this.timeoutHandle);
    
    // Debounce map updates to improve performance
    this.timeoutHandle = setTimeout(() => {
      if (this.map) {
        if (changes["zoom"] !== undefined) {
          this.map.setZoom(changes["zoom"].currentValue);
        }
        if (changes["lat"] !== undefined || changes["lng"] !== undefined) {
          this.map.setCenter({
            lat: changes["lat"]?.currentValue || this.lat,
            lng: changes["lng"]?.currentValue || this.lng,
          });
        }
      }
    }, 100); // 100ms debounce delay
  }

  ngAfterViewInit(): void {
    // Ensure we have a valid map container and haven't already initialized
    if (!this.map && this.mapDiv) {
      this.platform = new H["default"].service.Platform({
        apikey: "vJrfbfUY7UlHCvjAWR9maP3ggf9ES1dGcEBYaDNYAZ4",
      });
      const defaultLayers: any = this.platform.createDefaultLayers();

      const map = new H["default"].Map(
        this.mapDiv.nativeElement,
        defaultLayers.raster.normal.map,
        {
          pixelRatio: window.devicePixelRatio,
          center: { lat: 21.7679, lng: 78.8718 },
          politicalview: "IND",
          zoom: 4,
        }
      );

      H["default"].ui.UI.createDefault(map, defaultLayers);
      window.addEventListener("resize", () => map.getViewPort().resize());
      this.map = map;

      // Load pins from API
      this.pinService.getAll().subscribe((pins) => {
        for (const pin of pins) {
          this.placeMarker(pin);
        }
      });

      map.addEventListener("mapviewchange", (ev: H.map.ChangeEvent) => {
        this.notify.emit(ev);
      });

      map.addEventListener("tap", (ev: any) => {
        const coordinates = map.screenToGeo(
          ev.currentPointer.viewportX,
          ev.currentPointer.viewportY
        );
        this.reverseGeocode(coordinates.lat, coordinates.lng, this.platform);
      });

      new H["default"].mapevents.Behavior(
        new H["default"].mapevents.MapEvents(map)
      );
      
      console.log('👆 Map tapped at coordinates:', {
        lat: coordinates.lat.toFixed(6),
        lng: coordinates.lng.toFixed(6)
      });
      
      // Perform reverse geocoding to get address information
      this.reverseGeocode(coordinates.lat, coordinates.lng, this.platform);
    });
  }

  // Place a marker on the map for an existing Pin (from API)
  placeMarker(pin: Pin) {
    const icon = new H["default"].map.Icon("../../assets/location-pin.png", {
      size: { w: 50, h: 50 },
    });
    const marker = new H["default"].map.Marker(
      { lat: pin.lat, lng: pin.lng },
      { data: pin, icon }
    );
    
    console.log('🎮 Map behaviors enabled (pan, zoom, tap)');
  }

    const self = this;
    marker.addEventListener("tap", function (evt: Event) {
      evt.stopPropagation();
      self.openDialog(pin, marker);
    });

    this.map.addObject(marker);
    this.markers.push(marker);
    this.hitPoint.emit(this.markers);
  }

  removeMarker(marker: any) {
    this.map.removeObject(marker);
    const index = this.markers.findIndex((m) => m === marker);
    this.markers.splice(index, 1);
    this.hitPoint.emit(this.markers);
  }

  reverseGeocode(lat: any, lng: any, platform: any) {
    const geocoder = platform.getSearchService();
    geocoder.reverseGeocode(
      { at: lat + "," + lng, limit: "1" },
      (result: any) => {
        if (result.items.length) {
          const item = result.items[0];
          const title = item.address?.label || "Untitled pin";
          const address = item.address?.label || "";

          this.pinService.create(lat, lng, title, "", address).subscribe((pin) => {
            this.placeMarker(pin);
          });
        } else {
          this.dialog.open(ConfirmDialogComponent);
        }
      },
      this.onError
    );
  }

  onError(error: any) {
    alert("Can't reach the remote server");
  }

  searchTimer: any;
  fillSearchOptions(event: any) {
    if (event.target.value === "") return;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      console.log('🔍 Searching for:', query);
      
      const service = this.platform.getSearchService();
      service.geocode(
        { q: event.target.value },
        (result: GeocodeResult) => {
          this.searchOptions = result.items;
        },
        (error: any) => console.error("Search error:", error)
      );
    }, 600); // 600ms debounce delay
  }

  searchLocation(event: any): void {
    if (event === "") return;
    this.searchQuery = event;
    const service = this.platform.getSearchService();
    service.geocode(
      { q: event },
      (result: GeocodeResult) => {
        if (result.items.length > 0) {
          const location = result.items[0];
          console.log('📍 Centering map on:', location);
          
          this.map.setCenter(location.position);
          this.map.setZoom(14); // Zoom in for detailed view
        } else {
          console.warn('⚠️ No results found for search query');
        }
        this.searchOptions = [];
      }
    );
  }
}
