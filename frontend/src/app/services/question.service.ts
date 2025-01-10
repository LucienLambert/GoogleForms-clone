import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Question } from "../models/question";

@Injectable({providedIn: 'root'})
export class QuestionService {
    
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {

    }

    isTitleUnique(title: string, formId: number, questionId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}api/question/isTitleUnique`, {
            params: { title, formId, questionId }
        });
    }

    createQuestion(question : Question): Observable<Question> {
        return this.http.post<Question>(`${this.baseUrl}api/question/createQuestion`, question)
            .pipe(map(res => new Question(res)));
    }

    updateQuestion(question : Question): Observable<Question> {
        return this.http.put<Question>(`${this.baseUrl}api/question/updateQuestion`, question)
            .pipe(map(res => new Question(res)));
    }
    
    getOneById(id : number) : Observable<Question> {
        return this.http.get<Question>(`${this.baseUrl}api/question/id/${id}`)
            .pipe(map(res => new Question(res)));
    }
    
}