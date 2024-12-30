import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Form } from '../models/form';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {Question, QuestionType} from '../models/question';
import { AccessType } from '../models/userFormAccess';

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

    getFormWithQuestions(id: number): Observable<Form> {
        return this.http.get<Form>(`${this.baseUrl}api/forms/${id}/questions`)
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

    // Méthode pour récupérer le form pour le form manager
    //form + owner + listQuestion + optionList
    GetOneFormManager(id: number): Observable<Form> {
        return this.http.get<Form>(`${this.baseUrl}api/forms/${id}/manager`)
        .pipe(map((res: any) => {
            if (res.listQuestions) {                                                            //check si il ya des questions
                res.listQuestions.forEach((question: any) => {                                  //on commence à parcourir la liste des questions et pour chaque question
                question.questionType = this.enumToString(QuestionType, question.questionType); //appel de la fonction enumToString pour faire la convertion d'un enum en string
                });
            }
            return new Form(res);  // Créez une nouvelle instance de Form avec les données transformées (lisible par Angular)
            })
        );
    }

    //convertie un énum en string
    //enumeObj = questionType et value = question.questionType
    //le frontend récupe les énumes sous forme de int, il faut donc associé les int à leurs valeurs string (exemple 0 = Short, 1 = Long, etc)
    private enumToString(enumObj: any, value: number): string {
        const enumKey = Object.keys(enumObj).find(key => enumObj[key] === value);
        return enumKey || 'Unknown';  // Si la valeur n'existe pas dans l'énum, retournez 'Unknown'
    }

    DelQuestionFormById(formId: number, questionId : number): Observable<boolean>{
        return this.http.delete<boolean>(`${this.baseUrl}api/forms/${formId}/question/${questionId}`);
    }
    
    createForm(form: Form): Observable<Form> {
        return this.http.post<Form>(`${this.baseUrl}api/forms/createForm`, form)
            .pipe(map(res => new Form(res)));
    }

    updateForm(form: Form): Observable<Form> {
        return this.http.put<Form>(`${this.baseUrl}api/forms/updateForm`, form)
            .pipe(map(res => new Form(res)));
    }

    saveForm(form: Form): Observable<Form> {
        if (form.id) {
            return this.updateForm(form);
        } else {
            return this.createForm(form);
        }
    }

    isTitleUnique(title: string, ownerId: number, formId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.baseUrl}api/forms/isTitleUnique`, {
            params: { title, ownerId, formId }
        });

    }

    getFormQuestions(formId: number): Observable<Array<Question>> {
        return this.http.get<Array<Question>>(`${this.baseUrl}api/forms/getFormQuestionsById`, {
            params: { formId }
        });
    }
}
