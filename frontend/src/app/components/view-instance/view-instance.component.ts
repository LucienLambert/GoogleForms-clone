import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';

import {InstanceService} from '../../services/instance.service';
import {FormService} from '../../services/form.service';
import {User} from '../../models/user';
import {Form} from '../../models/form';
import {Question, QuestionType} from '../../models/question';
import {Instance} from '../../models/instance';
import {Answer} from "../../models/answer";

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
        this._answers = value;
        this.checkForRequiredQuestions()
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
  
        if (this.currentQuestion?.questionType == QuestionType.Check) {
            
            if ($event.length > 0) {
                let count = 1;
                let newAnswers : Answer[] = [];
                $event?.forEach((value : number) => {
                    
                    const answerData = {
                        instanceId: this.instance?.id,
                        questionId: this.currentQuestion?.id,
                        idx: count,
                        value: value,
                    }
                    newAnswers.push(new Answer(answerData));
                    ++count;
                });
                
                this.currentAnswers = newAnswers;
                this.updateAnswers();
                this.updateCurrentAnswers();
                //persist
                
            } else {
                this.currentAnswers = [];
                //persist
            }
            
        } else {
        
            if ($event) {
                const answerData = {
                    instanceId: this.instance?.id,
                    questionId: this.currentQuestion?.id,
                    idx: 0,
                    value: $event,
                }
                const answer = new Answer(answerData);
                this.answers?.push(answer);
                this.updateCurrentAnswers();
                //persist
            } else {
                this.currentAnswers = [];
                //persist
            }
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
                this.updateCurrentAnswers();
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
                if (!hasAnswer && !hascurrentAnswer) {
                    saveable = false;
                }
            }
        }
        if (!this.isInProgress() || !this.questions || !this.currentQuestion) {
            saveable = false;
        }
        this.isSaveable = saveable;
    }
}
