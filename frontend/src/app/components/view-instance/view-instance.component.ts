import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import {RedirectCommand} from "@angular/router";

import { InstanceService } from '../../services/instance.service';
import { FormService } from '../../services/form.service';
import { User } from '../../models/user';
import { Form } from '../../models/form';
import { Question } from '../../models/question';
import { QuestionType } from '../../models/question';
import { Instance } from '../../models/instance';
@Component({
    selector: 'app-view-instance',
    templateUrl: './view-instance.component.html',
    styleUrl:'./view-instance.component.css'
})
export class ViewInstanceComponent implements OnInit {

    user?: User;
    form?: Form;
    questions: Question[] = new Array<Question>();
    instance?: Instance;
    
    isCompleted: boolean = false;
    
    
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
                this.questions=this.form.questions;
                // console.log("form fetched:",this.form);
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
        
        this.instanceService.getInstanceByFormId(formId).subscribe({
            next: (data) => {
                this.instance=data;
                // console.log("instance fetched:",this.instance);
            },
            error: (err) => {  
                // ...
                switch (err.status) {
                    case 404:
                        
                }
            }
            
        });
        
        
    }
    isInProgress(): boolean {
        return !this.instance?.completed;
    }

    onSave() {
        console.log("saved button pressed");
    }

    protected readonly QuestionType = QuestionType;
}
