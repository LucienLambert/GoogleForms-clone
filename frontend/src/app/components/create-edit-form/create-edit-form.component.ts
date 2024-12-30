import {Component, Input, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {AuthenticationService} from "../../services/authentication.service";
import {FormService} from "../../services/form.service";
import {Form} from "../../models/form";
import {User} from "../../models/user";
import {UserService} from "../../services/user.service";
import {BehaviorSubject, debounceTime, Observable, of, switchMap, take, tap} from "rxjs";
import {catchError, filter, map} from "rxjs/operators";

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
    ownerLoaded = new BehaviorSubject<User | null>(null);

    backButtonVisible: boolean = true;
    isSearchVisible: boolean = false;
    isAddVisible: boolean = false;
    isSaveVisible: boolean = true;
    isSaveDisabled: boolean = true;
    isAnalyseVisible: boolean = false;
    showSuccessMessage: any;
    showErrorMessage: any;

    constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
                private authenticationService: AuthenticationService, private formService: FormService, 
                private userService: UserService) {}

    ngOnInit() {
        this.form = this.formBuilder.group({
            id: [''],
            title: ['', [Validators.required, Validators.minLength(3)], [this.uniqueTitleValidator.bind(this)]],
            description: ['', Validators.minLength(3)],
            owner: ['', Validators.required],
            isPublic: [false]
        });

        this.fetchOwnerData(); // Fetch owner data at initialization

        this.route.paramMap.subscribe(params => {
            const idParam = params.get('id');
            if (idParam) {
                const id = Number(idParam);
                if (!isNaN(id)) {
                    this.navBarTitle = 'Edit Form';
                    this.loadForm(id);
                } else {
                    console.error('Invalid form ID:', idParam);
                }
            } else {
                this.navBarTitle = 'New Form';
            }
        });

        this.form.statusChanges.subscribe((status) => {
            this.isSaveDisabled = status !== 'VALID';
        });
    }

    loadForm(id: number) {
        this.fetchOwnerData();
        this.formService.getFormByFormId(id).subscribe({
            next: (formData: Form) => {
                this.form.patchValue({
                    id: formData.id,
                    title: formData.title,
                    description: formData.description,
                    isPublic: formData.isPublic
                });
                this.owner = formData.owner;
            },
            error: (err) => {
                console.error('Error loading form:', err);
            }
        });
    }

    fetchOwnerData(): void {
        const userId = this.authenticationService.getCurrentUser()?.id;
        this.userService.getUserById(userId!).subscribe({
            next: (owner) => {
                this.owner = owner;
                this.ownerLoaded.next(owner); // Notify that owner is loaded
                this.form.patchValue({ owner: `${owner.firstName} ${owner.lastName}` });
            },
            error: (err) => {
                console.error('Error fetching owner data:', err);
            }
        });
    }

    onSave() {
        if (this.form.valid) {
            this.fetchOwnerData();
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
                    this.router.navigate(['/home']);
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

        const formId = Number(this.route.snapshot.paramMap.get('id'));

        return this.ownerLoaded.pipe(
            // Wait until the owner is available
            filter((owner) => !!owner),
            take(1), // Complete after receiving the first value
            switchMap((owner) => {
                const ownerId = owner!.id;
                return this.formService.isTitleUnique(control.value, ownerId, formId);
            }),
            map((isUnique) => (isUnique ? null : { unique: true })),
            catchError(() => of(null)) // Handle errors gracefully
        );
    }
}