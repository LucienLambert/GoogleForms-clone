import {Component, Input, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthenticationService} from "../../services/authentication.service";

@Component({
    selector: "app-create-edit-form",
    templateUrl: "./create-edit-form.component.html",
    styleUrls: ["./create-edit-form.component.css"]
})
export class CreateEditFormComponent implements OnInit {

    form!: FormGroup;
    returnUrl?: string;

    backButtonVisible: boolean = true;
    isSearchVisible: boolean = false;
    isAddVisible: boolean = false;
    isSaveVisible: boolean = true;

    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
                private authenticationService: AuthenticationService) {}

    ngOnInit() {
        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            owner: ['', Validators.required],
            checkbox: [false, Validators.required]
        });
        
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    }

    onSave() {
        if (this.form.valid) {
            console.log('Form submitted:', this.form.value);
        } else {
            console.log('Form is invalid');
        }
    }
}