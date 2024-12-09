import {Component, Input, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthenticationService} from "../../services/authentication.service";
import {FormService} from "../../services/form.service";
import {Form} from "../../models/form";
import {User} from "../../models/user";
import {UserService} from "../../services/user.service";

@Component({
    selector: "app-create-edit-form",
    templateUrl: "./create-edit-form.component.html",
    styleUrls: ["./create-edit-form.component.css"]
})
export class CreateEditFormComponent implements OnInit {

    form!: FormGroup;
    returnUrl?: string;
    owner?: User;

    backButtonVisible: boolean = true;
    isSearchVisible: boolean = false;
    isAddVisible: boolean = false;
    isSaveVisible: boolean = true;

    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
                private authenticationService: AuthenticationService, private formService: FormService, 
                private userService: UserService) {}

    ngOnInit() {
        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            owner: ['', Validators.required],
            checkbox: [false, Validators.required]
        });
        
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        
        this.fetchOwnerData();
    }

    fetchOwnerData() {
        const userId = this.authenticationService.getCurrentUser()?.id;
        this.userService.getUserById(userId!).subscribe({
            next: (owner) => {
                this.owner = owner;
                this.form.patchValue({ owner: owner.firstName + " " + owner.lastName });
            },
            error: (err) => {
                console.error('Error fetching owner data:', err);
            }
        });
    }

    onSave() {
        if (this.form.valid) {
            const formData: Form = this.form.value;
            formData.owner = this.owner!;
            this.returnUrl = '/home';

            this.formService.createForm(formData).subscribe({
                next: (response) => {
                    console.log('Form successfully created:', response);
                    this.router.navigate([this.returnUrl]);
                },
                error: (err) => {
                    console.error('Error while creating the form:', err);
                }
            });
        } else {
            console.log('Form is invalid');
        }
    }
}