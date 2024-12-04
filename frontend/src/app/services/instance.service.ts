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
    
    getInstanceByFormId(id: number): Observable<Instance> {
        return this.http.get<Instance>(`${this.baseUrl}api/instances/by_form_or_fresh/${id}`)
            .pipe(map(res => new Instance(res))
            );
    }




}
