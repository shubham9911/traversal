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
  private platform: any;
  @Input() public zoom = 2;
  @Input() public lat = 0;
  @Input() public lng = 0;
  isMarker: boolean = false;
  markers: any[] = [];
  @ViewChild("map") mapDiv?: ElementRef;
  private timeoutHandle: any;
  @Output() notify = new EventEmitter();
  @Output() hitPoint = new EventEmitter();
  searchQuery: string = "";
  searchOptions: any[] = [];

  constructor(public dialog: MatDialog, private pinService: PinService) {}

  ngOnInit() {}

  openDialog(pin: Pin, marker?: any) {
    const dialogRef = this.dialog.open(PinDialogComponent, {
      width: "750px",
      data: { data: pin },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.delete) {
        this.pinService.delete(pin.id).subscribe(() => this.removeMarker(marker));
      }

      if (result?.info !== undefined) {
        this.pinService.update(pin.id, pin.title, result.info).subscribe((updated) => {
          pin.note = updated.note;
        });
      }
      this.isMarker = false;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    clearTimeout(this.timeoutHandle);
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
    }, 100);
  }

  ngAfterViewInit(): void {
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
    }
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
      const service = this.platform.getSearchService();
      service.geocode(
        { q: event.target.value },
        (result: GeocodeResult) => {
          this.searchOptions = result.items;
        },
        (error: any) => console.error("Search error:", error)
      );
    }, 600);
  }

  searchLocation(event: any): void {
    if (event === "") return;
    this.searchQuery = event;
    const service = this.platform.getSearchService();
    service.geocode(
      { q: event },
      (result: GeocodeResult) => {
        if (result.items.length > 0) {
          this.map.setCenter(result.items[0].position);
          this.map.setZoom(14);
        }
        this.searchOptions = [];
      }
    );
  }
}
