import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Form } from '../models/form';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FormService {

    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {

    }

    //recupération des formulaires du CurrentUser.
    getUserForms(): Observable<Form[]> {
        return this.http.get<Form[]>(`${this.baseUrl}api/forms/User/forms`)
          .pipe(map(res => res.map(m => new Form(m))));
    }

    //récupération des formulaires Public
    getPublicFoms(): Observable<Form[]>{
        return this.http.get<Form[]>(`${this.baseUrl}api/forms/Public/forms`)
            .pipe(map(res => res.map(m => new Form(m))));
    }

    getFormByFormId(id: number): Observable<Form> {
        return this.http.get<Form>(`${this.baseUrl}api/forms/id/${id}`)
            .pipe(map(res => new Form(res)))
    }

    //récupération de la requete getOwnerPublicAccessForm
    //du FormController pour récupérer les formulaires que le currentUser doit afficher
    getOwnerPublicAccessForm() : Observable<Form[]> {
        return this.http.get<Form[]>(`${this.baseUrl}api/forms/Owner_Public_Access/forms`)
            .pipe(map(res => res.map(m => new Form(m))));
    }
    
    getAllForm() : Observable<Form[]> {
        return this.http.get<Form[]>(`${this.baseUrl}api/forms`)
            .pipe(map(res => res.map(m => new Form(m))));
    }
}
