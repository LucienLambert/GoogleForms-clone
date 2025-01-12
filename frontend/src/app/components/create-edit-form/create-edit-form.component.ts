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
    formSave?: Form;

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
            id: [0],
            title: ['', [Validators.required, Validators.minLength(3)], [this.uniqueTitleValidator.bind(this)]],
            description: ['', Validators.minLength(3)],
            owner: ['', Validators.required],
            isPublic: [false]
        });

        this.fetchOwnerData().subscribe({
            next: () => {
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
            }})
        
        this.form.statusChanges.subscribe((status) => {
            this.isSaveDisabled = status !== 'VALID';
        });
    }

    loadForm(id: number) {
        this.formService.getFormByFormId(id).subscribe({
            next: (formData: Form) => {
                this.form.patchValue({
                    id: formData.id,
                    title: formData.title,
                    description: formData.description,
                    isPublic: formData.isPublic
                });
                this.owner = formData.owner;
                this.formSave = formData;
            },
            error: (err) => {
                console.error('Error loading form:', err);
            }
        });
    }

    fetchOwnerData(): Observable<User> {
        const userId = this.authenticationService.getUserIdFromToken();
        return this.userService.getUserById(userId!).pipe(
            tap(owner => {
                this.owner = owner;
                this.ownerLoaded.next(owner);
                const ownerName = owner.firstName && owner.lastName ? `${owner.firstName} ${owner.lastName}` : owner.email;
                this.form.patchValue({ owner: ownerName });
            })

        );
    }

    onSave() {
        if (this.form.valid) {
            // Wait for owner data to load before saving
            this.fetchOwnerData().subscribe({
                next: () => {
                    const formData: Form = this.form.value;
                    formData.owner = this.owner!;
                    formData.ownerId = this.owner!.id;
                    const stateIsPublic = formData.isPublic;
                    formData.isPublic = !stateIsPublic

                    this.formService.saveForm(formData).subscribe({
                        next: (response) => {
                            this.formService.isPublicFormChange(this.formSave?.id!).subscribe();
                            this.form.patchValue(response);
                            this.navBarTitle = response.title || 'New Form';
                            this.showSuccessMessage = true;
                            setTimeout(() => (this.showSuccessMessage = false), 3000);
                            if (this.formSave?.id == null)
                                this.router.navigate(['/home']);
                            else
                                this.router.navigate(['/view-form', this.formSave?.id]);
                        },
                        error: (err) => {
                            this.showErrorMessage = true;
                            setTimeout(() => (this.showErrorMessage = false), 3000);
                        }
                    });
                },
                error: (err) => {
                    console.error('Error fetching owner data:', err);
                }
            });
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
    
    /*uniqueTitleValidator(control: AbstractControl): Observable<ValidationErrors | null> {
        if (!control.value) {
            return of(null); // Pass validation if no value is provided
        }

        const formId = Number(this.route.snapshot.paramMap.get('id')); // Retrieve the form ID

        return this.formService.isTitleUnique(control.value, formId).pipe(
            map((isUnique) => (isUnique ? null : { unique: true })), // Return validation result
            catchError(() => of(null)) // Handle errors gracefully
        );
    }*/
}