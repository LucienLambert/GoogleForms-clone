import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';

import {InstanceService} from '../../services/instance.service';
import {FormService} from '../../services/form.service';
import {Role, User} from '../../models/user';
import {Form} from '../../models/form';
import {Question, QuestionType} from '../../models/question';
import {Instance} from '../../models/instance';
import {Answer} from "../../models/answer";
import {ModalDialogComponent} from "../modal-dialog/modal-dialog.component";
import {MatDialog} from '@angular/material/dialog';

@Component({
    selector: 'app-view-instance',
    templateUrl: './view-instance.component.html',
    styleUrl:'./view-instance.component.css'
})
export class ViewInstanceComponent implements OnInit, OnDestroy {

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
        value = value?.sort(a=>a.questionId);
        this._answers = value;
        this.checkForRequiredQuestions()
    }
    currentAnswers?: Answer[];
    isSaveable: boolean = false;
    
    //navbar
    backButtonVisible: boolean = true;
    
    constructor(private authService: AuthenticationService, private router: Router,
                private instanceService: InstanceService, private formService: FormService, private route: ActivatedRoute, private modalDialog : MatDialog) {

    }
    
    ngOnInit() {
        const instanceId = Number(this.route.snapshot.paramMap.get('id'));
        this.fetchInstance(instanceId);
    }

    ngOnDestroy() {
    }
    
    saveCurrentAnswers() {
        if (this.currentAnswers && this.currentAnswers.length == 0) {
            this.instanceService.DeleteAnswersByInstanceIdAndQuestionId(this.instance?.id!, this.currentQuestion?.id!)
                .subscribe(res=> {
                })
        } else {
            let instanceIdAndCurrentAnswers : [number, Answer[]] = [this.instance!.id, this.currentAnswers!];
            this.instanceService.updateAnswers(instanceIdAndCurrentAnswers)
                     .subscribe(updatedAnswers => {
                         console.log("Updated answers!",updatedAnswers);
                     });
        }
    }
    
    switchQuestion(nb: number) {
        if (nb > 0 && nb <= this.questions.length) {
            if (this.isInProgress()) {
                // Sends to the backend
                this.saveCurrentAnswers();    
            }
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

    saveButtonAction() {
        if (this.instance) {
            this.instance.listAnswers.length = 0; 
            this.instance.listAnswers.push(...(this.answers ?? []), ...(this.currentAnswers ?? []));
            this.instanceService.updateInstance(this.instance)
                .subscribe({
                    next: (data) => {
                        this.router.navigate(['/home']);
                    },
                    error: (err) => {
                        console.log(err);
                    }
            });
        }
    }

    public receiveValue($event: any): void {
        if (!this.currentQuestion) {
            return;
        }
        const questionType = this.currentQuestion.questionType;
        if (questionType === QuestionType.Check) {
            this.handleCheckAnswers($event);
        } else {
            this.handleSingleAnswer($event, questionType);
        }
    }

    private handleCheckAnswers(selectedValues: string[]): void {
        if (!selectedValues.length) {
            this.currentAnswers = [];
        } else {
            let count = 1;
            let newAnswers : Answer[] = [];
            selectedValues.forEach((value : string) => {
                const answerData = {
                    instanceId: this.instance?.id,
                    questionId: this.currentQuestion?.id,
                    idx: count,
                    value: value.toString(),
                }
                newAnswers.push(new Answer(answerData));
                ++count;
            });
            this.currentAnswers = newAnswers;
        }
        this.updateAnswers();
        this.updateCurrentAnswers();
    }

    private handleSingleAnswer(value: any, questionType: QuestionType): void {
        if (!value) {
            this.currentAnswers = [];
        } else {
            const answerData = {
                instanceId: this.instance?.id,
                questionId: this.currentQuestion?.id,
                idx: 0,
                value: questionType === QuestionType.Date || questionType === QuestionType.Integer ? value : value?.trim(),
            };
            const answer = new Answer(answerData);
            this.answers?.push(answer);
        }
        this.updateCurrentAnswers();
    }

    private fetchInstance(instanceId: number) {
        
        this.instanceService.getOneByIdFull(instanceId).subscribe({
            next: (data) => {
                this.instance = new Instance(data);
                this.form = new Form(data.form);
                this.questions = this.form?.listQuestion;
                if (this.questions.length > 0) {
                    this.currentQuestion = this.questions[0];
                }
                this.answers=data.listAnswers;
                this.updateCurrentAnswers();
            },
            error: (err) => {
                // ...
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
    
    backButtonAction() {
        
        if (this.authService.currentUser?.role != Role.Guest) {
            
            if (this.isInProgress() && this.questions.length > 0) {
                this.saveCurrentAnswers()
            }
        } else {
            if (this.instance) {
                this.instanceService.deleteInstance(this.instance.id).subscribe({
                });
            }
            
        }
        
    }
    
    async deleteButtonAction(){
        const canDel = await this.modalDialogDelInstance();
        if(canDel && this.instance){
            this.instanceService.deleteInstance(this.instance.id).subscribe({
                next : (data) => {
                    this.router.navigate(['/home']);   
                }
            })
        }
        

    }
    private async modalDialogDelInstance() {
        return new Promise<boolean>((resolve) => {

            const modal = this.modalDialog.open(ModalDialogComponent, {
                disableClose: true,
                data : {
                    title: 'Delete Instance?',
                    message: "Are you sure you want to delete the current instance and go back to the forms list?",
                    context : 'editForm'
                },
            });

            modal.afterClosed().subscribe(result => {
                resolve(result);
            });
        });
    }
    
    
}
