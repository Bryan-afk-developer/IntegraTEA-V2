import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Pictogram {
  _id: string;
  name: string;
  category: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class PictogramService {
  private apiUrl = '/api/pictograms'; // Usa el proxy

  constructor(private http: HttpClient) { }

  getPictograms(): Observable<Pictogram[]> {
    return this.http.get<Pictogram[]>(this.apiUrl);
  }
}