import {Component, Input, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {AuthenticationService} from "../../services/authentication.service";
import {FormService} from "../../services/form.service";
import {Form} from "../../models/form";
import {User} from "../../models/user";
import {UserService} from "../../services/user.service";
import {debounceTime, Observable, of, switchMap} from "rxjs";
import {catchError, map} from "rxjs/operators";

@Component({
    selector: "app-create-edit-form",
    templateUrl: "./create-edit-form.component.html",
    styleUrls: ["./create-edit-form.component.css"]
})
export class CreateEditFormComponent implements OnInit {

    form!: FormGroup;
    returnUrl?: string;
    owner?: User;
    navBarTitle = 'New Form';

    backButtonVisible: boolean = true;
    isSearchVisible: boolean = false;
    isAddVisible: boolean = false;
    isSaveVisible: boolean = true;
    isSaveDisabled: boolean = true;
    showSuccessMessage: any;
    showErrorMessage: any;

    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
                private authenticationService: AuthenticationService, private formService: FormService, 
                private userService: UserService) {}

    ngOnInit() {
        this.form = this.formBuilder.group({
            title: ['', [Validators.required, Validators.minLength(3)], [this.uniqueTitleValidator.bind(this)]],
            description: ['', Validators.minLength(3)],
            owner: ['', Validators.required],
            isPublic: [false]
        });

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

        this.fetchOwnerData();

        this.form.statusChanges.subscribe((status) => {
            this.isSaveDisabled = status !== 'VALID';
        });
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
            formData.ownerId = this.owner!.id;

            this.formService.saveForm(formData).subscribe({
                next: (response) => {
                    this.fetchOwnerData();
                    // Update the page with the new data and title
                    this.form.patchValue(response);
                    this.navBarTitle = response.title || 'New Form';
                    
                    // Show success message
                    this.showSuccessMessage = true;
                    setTimeout(() => {
                        this.showSuccessMessage = false;
                    }, 3000);
                },
                error: (err) => {
                    // Show error message
                    this.showErrorMessage = true;
                    setTimeout(() => {
                        this.showErrorMessage = false;
                    }, 3000);
                }
            });
        } else {
            console.log('Form is invalid');
        }
    }

    uniqueTitleValidator(control: AbstractControl): Observable<ValidationErrors | null> {
        if (!control.value) {
            return of(null);
        }

        const ownerId = this.owner?.id;

        return of(control.value).pipe(
            debounceTime(300), // Delay to reduce API calls
            switchMap((title) => this.formService.isTitleUnique(title, ownerId!)), // Call the backend
            map((isUnique) => (isUnique ? null : { unique: true })), // Return validation result
            catchError(() => of(null)) // Handle errors gracefully
        );
    }
}