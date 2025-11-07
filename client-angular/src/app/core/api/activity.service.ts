import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Definimos la "forma" de una actividad
export interface Activity {
  _id: string;
  childId: { _id: string, firstName: string, lastName: string }; // Objeto populado
  educatorId: { _id: string, firstName: string, lastName: string }; // Objeto populado
  pictogramIds: any[];
  status: 'asignada' | 'completada';
  score?: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = '/api/activities'; // Usa el proxy

  constructor(private http: HttpClient) { }

  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(this.apiUrl);
  }

  getActivityById(id: string): Observable<Activity> {
    return this.http.get<Activity>(`${this.apiUrl}/${id}`);
  }

  createActivity(data: any): Observable<Activity> {
    return this.http.post<Activity>(this.apiUrl, data);
  }

  updateActivity(id: string, data: any): Observable<Activity> {
    return this.http.put<Activity>(`${this.apiUrl}/${id}`, data);
  }

  deleteActivity(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}