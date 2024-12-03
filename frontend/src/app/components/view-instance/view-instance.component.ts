import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import {RedirectCommand} from "@angular/router";

import { InstanceService } from '../../services/instance.service';
import { FormService } from '../../services/form.service';
import { Form } from '../../models/form';
import { Instance } from '../../models/instance';
import { parseISO } from 'date-fns';

@Component({
    selector: 'app-view-instance',
    templateUrl: './view-instance.component.html',
    styleUrl:'./view-instance.component.css'
})
export class ViewInstanceComponent implements OnInit {

    user?: User;
    form?: Form;
    instance?: Instance | null;
    
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
        
        
        
        this.formService.getFormByFormId(formId).subscribe({
            next: (data) => {
                this.form=data;
                console.log("form fetched:",this.form);
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
                console.log("instance fetched:",this.instance);
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

}
