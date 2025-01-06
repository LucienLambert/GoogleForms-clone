import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class QuestionService {
    
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {

    }

    isTitleUnique(title: string, formId: number, questionId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}api/question/isTitleUnique`, {
            params: { title, formId, questionId }
        });
    }
    
}