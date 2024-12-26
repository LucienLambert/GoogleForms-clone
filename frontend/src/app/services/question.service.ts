import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class QuestionService {
    
    constructor(private http: HttpClient, @Inject('BASE_URL') private baseUrl: string) {

    }

    
}