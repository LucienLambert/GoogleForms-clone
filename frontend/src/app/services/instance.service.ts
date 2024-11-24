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



    getFormByFormId(id: number): Observable<Form> {
        console.log(this.http.get<Form>(`${this.baseUrl}api/forms/id/${id}`));
        return this.http.get<Form>(`${this.baseUrl}api/forms/id/${id}`)
            .pipe(map(res => new Form(res)))
    }




}
