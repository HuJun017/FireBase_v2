import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Book {
  ID:number
  title: string;
  author: string;
  year: number;
  category: string;
  image: string;
  description: string;
  total_copies: number;
  available_copies: number;
}

@Injectable({
  providedIn: 'root',
})

export class HomeService {

  private apiUrl = 'https://bug-free-xylophone-r47579vxv5v5c5pw-3000.app.github.dev/books';
  constructor(private http: HttpClient) {}

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  rentBook(bookID: number) {
    return this.http.post(`https://bug-free-xylophone-r47579vxv5v5c5pw-3000.app.github.dev/rent/${bookID}`, {});
  }

}
