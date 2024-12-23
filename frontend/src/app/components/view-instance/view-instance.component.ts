import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import {RedirectCommand} from "@angular/router";

import { InstanceService } from '../../services/instance.service';
import { FormService } from '../../services/form.service';
import { User } from '../../models/user';
import { Form } from '../../models/form';
import { Question } from '../../models/question';
import { Instance } from '../../models/instance';
import {forEach} from "lodash-es";
import {Answer} from "../../models/answer";
import {MatIconModule} from '@angular/material/icon';
@Component({
    selector: 'app-view-instance',
    templateUrl: './view-instance.component.html',
    styleUrl:'./view-instance.component.css'
})
export class ViewInstanceComponent implements OnInit {

    user?: User;
    form?: Form;
    instance?: Instance;
    questions: Question[] = new Array<Question>();
    currentQuestion?: Question;
    questionTracker: number = 1;
    isCompleted: boolean = false;
    answers?: Answer[];
    currentAnswers?: Answer[];
    
    
    //TODO:refactor
    backButtonVisible: boolean = true;
    isSearchVisible: boolean = false;
    isAddVisible: boolean = false;
    isSaveVisible: boolean = false;
    
    
    constructor(private authService: AuthenticationService, private router: Router,
                private instanceService: InstanceService, private formService: FormService, private route: ActivatedRoute) {

    }
    
    
    ngOnInit() {
        
        //TODO: security
        
        const formId = Number(this.route.snapshot.paramMap.get('id'));
        
        this.formService.getFormWithQuestions(formId).subscribe({
            next: (data) => {
                this.form=data;
                this.questions=this.form.listQuestion;
                this.currentQuestion=this.questions[0];
                this.updateCurrentAnswers();
            },
            error: (err) => {
                console.log(err);
                switch (err.status) {
                    case 404:
                        this.router.navigate(['/unknown']);
                        break;
                    case 401:
                        this.router.navigate(['/restricted']);
                        break;
                    default:
                        this.router.navigate(['/unknown']);
                }
            }
        });
        
        this.instanceService.getExistingOrFreshInstanceByFormId(formId).subscribe({
            next: (data) => {
                this.instance=data;
                this.answers=data.listAnswers;
            },
            error: (err) => {  
                // ...
                switch (err.status) {
                    case 404:
                        
                }
            }
            
        });
        
        
    }
    
    switchQuestion(nb: number) {
        if (nb > 0 && nb <= this.questions.length) {
            this.currentQuestion = this.questions[nb-1];
            this.questionTracker = nb;
            this.updateAnswers();
            this.updateCurrentAnswers();
        }
        
    }
    updateAnswers() {
        this.currentAnswers?.forEach(answer=>this.answers?.push(answer));
    }

    updateCurrentAnswers(){
        this.currentAnswers = [];
        if (this.answers && this.answers.length > 0) {
            var temp : Answer[] = [];
            this.answers?.forEach( (answer) => {
                if (this.currentQuestion != undefined && answer.questionId === this.currentQuestion.id) {
                    temp.push(answer);
                }
            })
            this.currentAnswers = temp;
            this.answers = this.answers.filter((answer) => answer.questionId !== this.currentQuestion?.id);
        }
    }
    
    
    isInProgress(): boolean {
        return !this.instance?.completed;
    }

    deleteButtonAction(){
        console.log("delete button pressed");
    }

    saveButtonAction() {
        console.log("saved button pressed");
    }
}
