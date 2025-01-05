import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Instance } from '../models/instance';
import { Form } from '../models/form';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {Answer} from "../models/answer";

@Injectable({ providedIn: 'root' })
export class InstanceService {

    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {

    }

    getExistingOrFreshInstanceByFormId(id: number): Observable<Instance> {
        return this.http.get<Instance>(`${this.baseUrl}api/instances/by_form_or_fresh/${id}`)
            .pipe(map(res => new Instance(res))
            );
    }
    
    
    updateAnswers(answers: [number, Answer[]]): Observable<Instance> {
        let instanceData = {
            id: answers[0],
            listAnswers: answers[1]
        }
        const instance = new Instance(instanceData);
        return this.http.put<Instance>(`${this.baseUrl}api/instances/update/answers`, instance);
    }

    DeleteAnswersByInstanceIdAndQuestionId(instanceId: number, questionId : number): Observable<boolean>{
        console.log(`${this.baseUrl}api/instances/${instanceId}/question/${questionId}`)
        return this.http.delete<boolean>(`${this.baseUrl}api/instances/${instanceId}/question/${questionId}`);
    }

    updateInstance(instance: Instance): Observable<Instance> {
        return this.http.put<Instance>(`${this.baseUrl}api/instances/instance/completed`, instance);
    }


}
