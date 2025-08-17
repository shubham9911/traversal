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
  AfterViewInit,
  OnChanges,
} from '@angular/core';
import * as H from '@here/maps-api-for-javascript';
import { PinDialogComponent } from '../dashboard/pin-dialog/pin-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../general/confirm-dialog/confirm-dialog.component';

/**
 * Interface for HERE Maps Geocoding API Results
 * 
 * Defines the structure of geocoding response data from HERE Maps.
 * Used for type safety when handling location search results.
 */
interface GeocodeResult {
  items: { position: H.geo.Point }[];
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnChanges {
  
  // ==================== CORE MAP PROPERTIES ====================
  
  /**
   * HERE Maps instance - the main map object
   * Private to prevent external manipulation
   */
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
  
  /** Local storage cache of marker data for persistence */
  locallyStoredMarkers: any[] = [];
  
  /** Timeout handle for debouncing input property changes */
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
  
  // ==================== SEARCH FUNCTIONALITY ====================
  
  /** Current search query string */
  searchQuery: string = '';
  
  /** Array of search autocomplete suggestions */
  searchOptions: any[] = [];
  
  /**
   * Constructor - Initialize component with required services
   * 
   * @param dialog - Material Dialog service for opening pin dialogs
   */
  constructor(public dialog: MatDialog) {
    console.log('🗺️ Map component initialized');
  }

  // ==================== DIALOG MANAGEMENT ====================

  /**
   * Pin Dialog Management - Open dialog for pin viewing/editing
   * 
   * Opens the pin information dialog when a user clicks on a marker.
   * Handles both viewing existing pin data and saving new information.
   * 
   * @param data - Pin data object containing location and note information
   * @param marker - The map marker object associated with this pin
   */
  openDialog(data: any, marker?: any): void {
    console.log('📍 Opening pin dialog for marker:', data?.title || 'Unknown location');
    
    const dialogRef = this.dialog.open(PinDialogComponent, {
      width: '750px',
      data: { data },
    });

    // Handle dialog result when user closes it
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.delete) {
        console.log('🗑️ User requested pin deletion');
        this.removeMarker(marker);
      }

      if (result?.info) {
        console.log('💾 Saving pin information');
        const index = this.markers.findIndex(
          (element: any) => element === marker
        );

        if (index !== -1) {
          // Update the stored marker data with new note information
          this.locallyStoredMarkers[index][2]['note'] = result.info;

          // Persist updated markers to local storage
          window.localStorage.setItem(
            'markers',
            JSON.stringify(this.locallyStoredMarkers)
          );
          
          console.log('✅ Pin information saved successfully');
        }
      }
      
      // Reset marker flag to allow new marker creation
      this.isMarker = false;
    });
  }

  /**
   * Object Serialization Utility
   * 
   * Converts objects with functions to JSON-serializable format.
   * Useful for debugging and logging complex HERE Maps objects.
   * 
   * @param obj - Object to make serializable
   * @returns JSON-serializable version of the object
   */
  makeSerializable(obj: any): any {
    return JSON.parse(
      JSON.stringify(obj, (key, value) =>
        typeof value === 'function' ? value.toString() : value
      )
    );
  }

  // ==================== COMPONENT LIFECYCLE ====================

  /**
   * Input Property Change Handler
   * 
   * Responds to changes in input properties (zoom, lat, lng) from parent component.
   * Uses debouncing to prevent excessive map updates during rapid changes.
   * 
   * @param changes - SimpleChanges object containing property change details
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Clear any pending updates to prevent conflicting changes
    clearTimeout(this.timeoutHandle);
    
    // Debounce map updates to improve performance
    this.timeoutHandle = setTimeout(() => {
      if (this.map) {
        // Update zoom level if changed
        if (changes['zoom'] !== undefined) {
          console.log('🔍 Updating map zoom to:', changes['zoom'].currentValue);
          this.map.setZoom(changes['zoom'].currentValue);
        }
        
        // Update map center if latitude or longitude changed
        if (changes['lat'] !== undefined || changes['lng'] !== undefined) {
          const newCenter = {
            lat: changes['lat']?.currentValue || this.lat,
            lng: changes['lng']?.currentValue || this.lng,
          };
          console.log('📍 Updating map center to:', newCenter);
          this.map.setCenter(newCenter);
        }
      }
    }, 100); // 100ms debounce delay
  }

  /**
   * Component Initialization - Set up HERE Maps
   * 
   * Called after the view is initialized. Creates and configures the HERE Maps
   * instance with all necessary features and event listeners.
   * 
   * Map Configuration:
   * - API key authentication
   * - Default layers (satellite, terrain, etc.)
   * - India-centered view with political boundaries
   * - Responsive design support
   * - User interaction behaviors (pan, zoom, tap)
   */
  ngAfterViewInit(): void {
    // Ensure we have a valid map container and haven't already initialized
    if (!this.map && this.mapDiv) {
      console.log('🚀 Initializing HERE Maps...');
      
      try {
        // Initialize HERE Maps platform with API key
        // TODO: Move API key to environment variables for security
        this.platform = new H['default'].service.Platform({
          apikey: 'vJrfbfUY7UlHCvjAWR9maP3ggf9ES1dGcEBYaDNYAZ4',
        });
        
        // Get default map layers (normal, satellite, terrain, etc.)
        const defaultLayers: any = this.platform.createDefaultLayers();

        // Create the main map instance
        const map = new H['default'].Map(
          this.mapDiv.nativeElement,           // Map container element
          defaultLayers.raster.normal.map,     // Use normal raster layer
          {
            pixelRatio: window.devicePixelRatio, // High DPI support
            center: { lat: 21.7679, lng: 78.8718 }, // Center on India
            politicalview: 'IND',               // Show India political boundaries
            zoom: 4,                            // Country-level zoom
          }
        );

        // Add default UI controls (zoom buttons, scale bar, etc.)
        const ui = H['default'].ui.UI.createDefault(map, defaultLayers);

        // Handle window resize events to maintain map responsiveness
        window.addEventListener('resize', () => {
          console.log('📱 Window resized, updating map viewport');
          map.getViewPort().resize();
        });

        // Store map reference for component use
        this.map = map;
        console.log('✅ HERE Maps initialized successfully');

        // Load any previously saved markers from local storage
        this.loadStoredMarkers();

        // Set up map event listeners
        this.setupMapEventListeners(map);

        // Enable map behaviors (pan, zoom, etc.)
        this.enableMapBehaviors(map);
        
      } catch (error) {
        console.error('❌ Failed to initialize HERE Maps:', error);
      }
    }
  }

  /**
   * Load Stored Markers - Restore pins from local storage
   * 
   * Retrieves previously saved markers from browser localStorage and
   * recreates them on the map for user convenience.
   */
  private loadStoredMarkers(): void {
    try {
      const addedMarkers = JSON.parse(
        window.localStorage.getItem('markers') || '[]'
      );
      
      console.log('📦 Loading stored markers:', addedMarkers.length);
      
      if (addedMarkers && addedMarkers.length) {
        // Recreate each stored marker
        for (let mark of addedMarkers) {
          let [lat, lng, result] = mark;
          this.addMarker(lat, lng, result);
        }
        
        // Update local storage reference
        this.locallyStoredMarkers = addedMarkers;
        console.log('✅ Restored', addedMarkers.length, 'markers from storage');
      }
    } catch (error) {
      console.error('❌ Failed to load stored markers:', error);
      // Clear corrupted data
      window.localStorage.removeItem('markers');
    }
  }

  /**
   * Setup Map Event Listeners
   * 
   * Configures event handlers for map interactions like view changes and taps.
   * 
   * @param map - The HERE Maps instance
   */
  private setupMapEventListeners(map: any): void {
    // Listen for map view changes (zoom, pan, etc.)
    map.addEventListener('mapviewchange', (ev: H.map.ChangeEvent) => {
      // Emit changes to parent component for state synchronization
      this.notify.emit(ev);
    });

    // Listen for map tap events (user clicks to place pins)
    map.addEventListener('tap', (ev: any) => {
      // Convert screen coordinates to geographic coordinates
      const coordinates = map.screenToGeo(
        ev.currentPointer.viewportX,
        ev.currentPointer.viewportY
      );
      
      console.log('👆 Map tapped at coordinates:', {
        lat: coordinates.lat.toFixed(6),
        lng: coordinates.lng.toFixed(6)
      });
      
      // Perform reverse geocoding to get address information
      this.reverseGeocode(coordinates.lat, coordinates.lng, this.platform);
    });
  }

  /**
   * Enable Map Behaviors
   * 
   * Activates interactive behaviors like pan, zoom, and keyboard navigation.
   * 
   * @param map - The HERE Maps instance
   */
  private enableMapBehaviors(map: any): void {
    // Enable pan, zoom, and other interactive behaviors
    new H['default'].mapevents.Behavior(
      new H['default'].mapevents.MapEvents(map)
    );
    
    console.log('🎮 Map behaviors enabled (pan, zoom, tap)');
  }

  // ==================== MARKER MANAGEMENT ====================

  /**
   * Add Marker to Map
   * 
   * Creates a new marker pin at the specified coordinates with custom icon
   * and interactive capabilities. Stores the marker data locally for persistence.
   * 
   * @param lat - Latitude coordinate for the marker
   * @param lng - Longitude coordinate for the marker  
   * @param result - Geocoding result data containing address information
   */
  addMarker(lat: any, lng: any, result: any): void {
    console.log('📍 Adding new marker at:', { lat, lng, title: result.title });
    
    try {
      // Create custom pin icon
      const icon = new H['default'].map.Icon('../../assets/location-pin.png', {
        size: { w: 50, h: 50 },
      });

      // Add to local storage for persistence
      this.locallyStoredMarkers.push([lat, lng, result]);
      window.localStorage.setItem(
        'markers',
        JSON.stringify(this.locallyStoredMarkers)
      );

      // Create the map marker object
      const marker = new H['default'].map.Marker(
        { lat, lng },
        { data: result, icon }
      );

      // Add click event listener to marker for opening pin dialog
      const self = this;
      marker.addEventListener('tap', function (evt: Event) {
        evt.stopPropagation(); // Prevent map tap event from firing
        console.log('📍 Marker tapped:', result.title);
        self.openDialog(result, marker);
      });

      // Add marker to map and update component state
      if (!this.isMarker) {
        this.map.addObject(marker);
        this.markers.push(marker);
        
        // Notify parent component of marker changes
        this.hitPoint.emit(this.markers);
        
        console.log('✅ Marker added successfully. Total markers:', this.markers.length);
        this.isMarker = false;
      }
    } catch (error) {
      console.error('❌ Failed to add marker:', error);
    }
  }

  /**
   * Remove Marker from Map
   * 
   * Removes a marker from both the map display and local storage.
   * Updates component state to reflect the change.
   * 
   * @param marker - The marker object to remove
   */
  removeMarker(marker: any): void {
    try {
      console.log('🗑️ Removing marker:', marker.data?.title);
      
      // Remove marker from map display
      this.map.removeObject(marker);
      
      // Find marker index in arrays
      const index = this.markers.findIndex((element: any) => element === marker);
      
      if (index !== -1) {
        // Remove from local storage
        this.locallyStoredMarkers.splice(index, 1);
        window.localStorage.setItem(
          'markers',
          JSON.stringify(this.locallyStoredMarkers)
        );
        
        // Remove from component markers array
        this.markers.splice(index, 1);
        
        // Notify parent component of changes
        this.hitPoint.emit(this.markers);
        
        console.log('✅ Marker removed successfully. Remaining markers:', this.markers.length);
      } else {
        console.warn('⚠️ Marker not found in markers array');
      }
    } catch (error) {
      console.error('❌ Failed to remove marker:', error);
    }
  }

  // ==================== GEOCODING SERVICES ====================

  /**
   * Reverse Geocoding - Convert coordinates to address
   * 
   * Takes latitude and longitude coordinates and converts them to a human-readable
   * address using HERE's reverse geocoding service. Creates a new pin if successful.
   * 
   * @param lat - Latitude coordinate to reverse geocode
   * @param lng - Longitude coordinate to reverse geocode
   * @param platform - HERE Maps platform instance for API access
   */
  reverseGeocode(lat: any, lng: any, platform: any): void {
    console.log('🔍 Reverse geocoding coordinates:', { lat, lng });
    
    try {
      // Get the HERE Maps search service
      const geocoder = platform.getSearchService();
      
      // Configure reverse geocoding parameters
      const reverseGeocodingParameters = {
        at: lat + ',' + lng,  // Coordinate string format
        limit: '1',           // Only return the best result
      };

      // Perform reverse geocoding request
      geocoder.reverseGeocode(
        reverseGeocodingParameters,
        (result: any) => {
          if (result.items.length) {
            console.log('📍 Reverse geocoding successful:', result.items[0].title);
            this.addMarker(lat, lng, result.items[0]);
          } else {
            console.warn('⚠️ No address found for coordinates');
            // Show confirmation dialog for unknown location
            this.dialog.open(ConfirmDialogComponent);
          }
        },
        this.onError
      );
    } catch (error) {
      console.error('❌ Reverse geocoding failed:', error);
      this.onError(error);
    }
  }

  /**
   * Geocoding Error Handler
   * 
   * Handles errors that occur during geocoding operations.
   * Provides user feedback and logs error details.
   * 
   * @param error - Error object from failed geocoding request
   */
  onError(error: any): void {
    console.error('❌ Geocoding service error:', error);
    alert("Can't reach the remote server. Please check your internet connection and try again.");
  }

  // ==================== SEARCH FUNCTIONALITY ====================

  /**
   * Search Input Handler - Populate autocomplete suggestions
   * 
   * Provides real-time search suggestions as the user types in the search box.
   * Uses debouncing to prevent excessive API calls.
   * 
   * @param event - Input event from search box
   */
  fillSearchOptions(event: any): void {
    const query = event.target.value;
    
    // Clear suggestions if search box is empty
    if (query === '') {
      this.searchOptions = [];
      return;
    }

    // Clear any existing search timer
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }

    // Debounce search requests to avoid excessive API calls
    this.searchTimer = setTimeout(() => {
      console.log('🔍 Searching for:', query);
      
      const service = this.platform.getSearchService();
      service.geocode(
        {
          q: query,
        },
        (result: GeocodeResult) => {
          console.log('🔍 Search results received:', result.items.length);
          this.searchOptions = result.items;
        },
        (error: any) => {
          console.error('❌ Error searching for location:', error);
          this.searchOptions = [];
        }
      );
    }, 600); // 600ms debounce delay
  }

  /**
   * Location Search - Navigate to searched location
   * 
   * Performs a geocoding search for the given query and centers the map
   * on the first result if found.
   * 
   * @param event - Search query string
   */
  searchLocation(event: string): void {
    // Ignore empty searches
    if (event === '') {
      return;
    }

    this.searchQuery = event;
    console.log('🎯 Searching for location:', event);

    // Use HERE Maps Geocoding and Search API
    const service = this.platform.getSearchService();
    service.geocode(
      {
        q: event,
      },
      (result: GeocodeResult) => {
        console.log('🎯 Location search completed:', result.items.length, 'results');
        
        // Clear any previous search markers
        // TODO: Consider keeping user pins separate from search results
        this.map.removeObjects(this.map.getObjects());
        
        // Navigate to first result if available
        if (result.items.length > 0) {
          const location = result.items[0];
          console.log('📍 Centering map on:', location);
          
          this.map.setCenter(location.position);
          this.map.setZoom(14); // Zoom in for detailed view
        } else {
          console.warn('⚠️ No results found for search query');
        }

        // Clear search suggestions
        this.searchOptions = [];
      },
      (error: any) => {
        console.error('❌ Location search failed:', error);
        this.searchOptions = [];
      }
    );
  }
}
