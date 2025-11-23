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
  private apiUrl = '/api/pictograms';

  constructor(private http: HttpClient) { }

  getPictograms(): Observable<Pictogram[]> {
    return this.http.get<Pictogram[]>(this.apiUrl);
  }

  createPictogram(name: string, category: string, imageFile: File): Observable<Pictogram> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('image', imageFile);

    return this.http.post<Pictogram>(this.apiUrl, formData);
  }
}