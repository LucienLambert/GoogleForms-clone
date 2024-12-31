import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../models/user';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import {OptionList} from "../models/optionList";

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) { }

    getAll(): Observable<User[]> {
        return this.http.get<any[]>(`${this.baseUrl}api/users`).pipe(
            map(res => plainToInstance(User, res))
        );
    }

    getUserById(userId: number): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}api/users/${userId}`);
    }
    
    getUserOptionLists(userId: number): Observable<Array<OptionList>> {
        return this.http.get<Array<OptionList>>(`${this.baseUrl}api/users/optionLists/${userId}`);
    }
}
