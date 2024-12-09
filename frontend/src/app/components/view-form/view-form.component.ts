import { Component, OnInit } from '@angular/core';
import { Form } from '../../models/form';

@Component({
    selector: 'app-view-form',
    templateUrl: "./view-form.component.html",
    styleUrl: "./view-form.component.css"
})
export class ViewFormComponent implements OnInit {
    form?: Form;
    backButtonVisible: boolean = true;
    
    ngOnInit() {
        
    }
}