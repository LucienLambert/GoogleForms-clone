import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Instance } from '../models/instance';
import { Form } from '../models/form';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstanceService {

    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {

    }


    
    getOneById(id: number): Observable<Form[]> {
        return this.http.get<Form[]>(`${this.baseUrl}api/forms/id`)
          .pipe(map(res => res.map(m => new Form(m))));
    }

}
