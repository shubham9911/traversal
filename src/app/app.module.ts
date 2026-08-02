/**
 * Main Application Module for Traversal
 * 
 * This is the root module that bootstraps the entire Angular application.
 * It imports and configures all necessary modules, components, and services
 * required for the Traversal map-based pin management system.
 * 
 * Key Features:
 * - Angular Material Design components
 * - HERE Maps integration
 * - User authentication system
 * - Dashboard for pin management
 * - HTTP client for API communication
 * - Responsive design with CDK Overlay
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

// Application routing
import { AppRoutingModule } from './app-routing.module';

// Core components
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { DashboardComponent } from './dashboard/dashboard.component';

// Feature modules
import { MaterialModule } from './material.module';
import { GeneralModule } from './general/general.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { OverlayModule } from '@angular/cdk/overlay';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';


@NgModule({
  declarations: [
    AppComponent,    // Root application component
    MapComponent,    // HERE Maps integration component
    DashboardComponent // Main dashboard for pin management
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    GeneralModule,
    AuthModule,
    HttpClientModule,
    DashboardModule,
    OverlayModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      // Configure Material form fields for dynamic sizing
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' },
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent], // Component to load when app starts
})
export class AppModule {}
