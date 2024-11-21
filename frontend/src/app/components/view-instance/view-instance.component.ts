import { Component, EventEmitter, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from '../../models/user';
import { ActivatedRoute, Router } from '@angular/router';
import {RedirectCommand} from "@angular/router";

import { InstanceService } from '../../services/instance.service';
import { Form } from '../../models/form';

@Component({
    selector: 'app-view-instance',
    templateUrl: './view-instance.component.html',
    styleUrl:'./view-instance.component.css'
})
export class ViewInstanceComponent implements OnInit {

    user?: User;
    form?: Form;

    constructor(private authService: AuthenticationService, private router: Router,
        private instanceService: InstanceService, private route: ActivatedRoute) {

            
    }

    ngOnInit() {
        const formId = this.route.snapshot.paramMap.get('id');
        const number = +formId!; 
        // console.log(number);
        // this.instanceService.getOneById(number).subscribe({
        //     next: (data) => {
        //         this.form=data;
        //     }

        // });
        // console.log(form);

        
        

    }
}
