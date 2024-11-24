import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import {RedirectCommand} from "@angular/router";

import { InstanceService } from '../../services/instance.service';
import { FormService } from '../../services/form.service';
import { Form } from '../../models/form';
import { Instance } from '../../models/instance';

@Component({
    selector: 'app-view-instance',
    templateUrl: './view-instance.component.html',
    styleUrl:'./view-instance.component.css'
})
export class ViewInstanceComponent implements OnInit {

    user?: User;
    form?: Form;
    instance?: Instance;

    constructor(private authService: AuthenticationService, private router: Router,
        private instanceService: InstanceService, private route: ActivatedRoute) {

            
    }

    ngOnInit() {
        
        //TODO: security
        
        const formId = Number(this.route.snapshot.paramMap.get('id'));
        
        this.instanceService.getFormByFormId(formId).subscribe({
            next: (data) => {
                this.form=data;
                console.log("form fetched:",this.form);
            },
            error: (err) => {
                console.log(err);
            }
        })

        
        

    }
}
