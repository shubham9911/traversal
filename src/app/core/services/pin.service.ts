import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Pin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  note: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class PinService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Pin[]>(`${environment.apiUrl}/pins`);
  }

  create(lat: number, lng: number, title: string, note: string, address: string) {
    return this.http.post<Pin>(`${environment.apiUrl}/pins`, { lat, lng, title, note, address });
  }

  update(id: string, title: string, note: string) {
    return this.http.put<Pin>(`${environment.apiUrl}/pins/${id}`, { title, note });
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/pins/${id}`);
  }
}
