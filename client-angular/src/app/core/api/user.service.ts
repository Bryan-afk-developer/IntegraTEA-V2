import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Definimos "Interfaces" (tipos) para que nuestro código sea limpio
// y profesional.
export interface Educator {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  createdAt: string;
  role: 'Educador';
}

export interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  age: number;
  educatorId: string;
  createdAt: string;
  role: 'Niño';
}

// Un "tipo" que puede ser un Educador O un Niño
export type User = Educator | Child;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Usamos /api para que nuestro "proxy.conf.json" funcione
  private educatorsApi = '/api/educators';
  private childrenApi = '/api/children';

  constructor(private http: HttpClient) { }

  // --- API de Educadores ---
  getEducators(): Observable<Educator[]> {
    return this.http.get<Educator[]>(this.educatorsApi);
  }

  getEducatorById(id: string): Observable<Educator> {
    return this.http.get<Educator>(`${this.educatorsApi}/${id}`);
  }

  createEducator(data: any): Observable<Educator> {
    return this.http.post<Educator>(this.educatorsApi, data);
  }

  updateEducator(id: string, data: any): Observable<Educator> {
    return this.http.put<Educator>(`${this.educatorsApi}/${id}`, data);
  }

  deleteEducator(id: string): Observable<any> {
    return this.http.delete(`${this.educatorsApi}/${id}`);
  }

  // --- API de Niños ---
  getChildren(): Observable<Child[]> {
    return this.http.get<Child[]>(this.childrenApi);
  }

  getChildById(id: string): Observable<Child> {
    return this.http.get<Child>(`${this.childrenApi}/${id}`);
  }

  createChild(data: any): Observable<Child> {
    return this.http.post<Child>(this.childrenApi, data);
  }

  updateChild(id: string, data: any): Observable<Child> {
    return this.http.put<Child>(`${this.childrenApi}/${id}`, data);
  }

  deleteChild(id: string): Observable<any> {
    return this.http.delete(`${this.childrenApi}/${id}`);
  }
}