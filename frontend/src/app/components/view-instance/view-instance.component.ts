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
    
    private _answers: Answer[] | undefined;
    public get answers(): Answer[] | undefined {
        return this._answers;
    }
    public set answers(value: Answer[] | undefined) {
        if (value !== this._answers) {
            this._answers = value;
            this.checkForRequiredQuestions()
        }
    }
    currentAnswers?: Answer[];
    isSaveable: boolean = false;
    
    
    //TODO:refactor
    backButtonVisible: boolean = true;
    isSearchVisible: boolean = false;
    isAddVisible: boolean = false;
    isSaveVisible: boolean = false;
    
    
    constructor(private authService: AuthenticationService, private router: Router,
                private instanceService: InstanceService, private formService: FormService, private route: ActivatedRoute) {

    }
    
    
    ngOnInit() {
        
        const formId = Number(this.route.snapshot.paramMap.get('id'));
        
        this.fetchFormWithQuestions(formId);
        this.fetchInstance(formId);
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

    // received value after answering the question
    public receiveValue($event : any){

        if ($event || $event == ""){

            const answerData = {
                instanceId: this.instance?.id,
                questionId: this.currentQuestion?.id,
                idx: 0,
                value: $event,
            }
            const answer = new Answer(answerData);

            this.answers?.push(answer);
            
            this.updateCurrentAnswers();
            
        } 
        
    }

    private fetchFormWithQuestions(formId : number) {
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
    }


    private fetchInstance(formId: number) {


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

    private checkForRequiredQuestions() {
        let saveable = true;

        for (const question of this.questions) {
            if (question.required) {
                
                const hasAnswer = this.answers?.some(answer => answer.questionId === question.id);
                const hascurrentAnswer = this.currentAnswers?.some(answer => answer.questionId === question.id);
                if (!hasAnswer || !hascurrentAnswer) {
                    saveable = false;
                }
            }
        }
        if (!this.isInProgress()) {
            saveable = false;
        }        
        this.isSaveable = saveable;
    }
}
