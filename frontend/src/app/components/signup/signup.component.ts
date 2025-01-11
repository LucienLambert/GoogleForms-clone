import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from 'src/app/services/authentication.service';
import {UserService} from 'src/app/services/user.service';
import {Router} from '@angular/router';
import {AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable, of} from 'rxjs';
import {Role, User} from "../../models/user";


@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignUpComponent implements OnInit {
    signupForm: FormGroup;

    constructor(
        private authenticationService: AuthenticationService,
        private router: Router,
        private fb: FormBuilder,
        private userService: UserService
    ) {
        if (this.authenticationService.currentUser) {
            this.router.navigate(['/home']);
        }

        this.signupForm = this.fb.group({
            firstName: this.fb.control('', {
                validators: [Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^\S(.*\S)?$/)],
                asyncValidators: [this.fullNameAsyncValidator()],
            }),
            lastName: this.fb.control('', {
                validators: [Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^\S(.*\S)?$/)],
                asyncValidators: [this.fullNameAsyncValidator()],
            }),
            birthDate: ['', [Validators.required, this.ageValidator(18, 125)]],
            email: this.fb.control('', {
                validators: [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,}$/)],
                asyncValidators: [this.emailAsyncValidator()],
            }),
            password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10), Validators.pattern(/^\S(.*\S)?$/)]],
            confirmPassword: ['', Validators.required]
        }, {
            validator: [this.namesConditionalValidator, this.passwordMatchValidator]
        });

    }

    ngOnInit(): void {
        // Écouter les changements sur le champ lastName / firstname et marque l'autre comme touché pour trigger les messages d'erreur
        const firstNameControl = this.signupForm.get('firstName');
        if (firstNameControl) {
            firstNameControl.valueChanges.subscribe(() => {
                const lastNameControl = this.signupForm.get('lastName');
                if (lastNameControl) {
                    lastNameControl.markAsTouched(); // Marquer lastName comme touché
                }
            });
        }

        const lastNameControl = this.signupForm.get('lastName');
        if (lastNameControl) {
            lastNameControl.valueChanges.subscribe(() => {
                const firstNameControl = this.signupForm.get('firstName');
                if (firstNameControl) {
                    firstNameControl.markAsTouched();// Marquer firstName comme touché
                }
            });
        }
    }

    emailAsyncValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<any> => {
            if (!control.value) {
                return of(null); 
            }

            return new Observable((observer) => {
                this.userService.isEmailUnique(control.value).subscribe(
                    (response: any) => {
                        if (response === true) {
                            observer.next(null);  // Email is unique, no error
                        }
                        observer.complete(); 
                    },
                    (error) => {
                        // Error handling if the request fails
                        if (error.status === 409) {
                            // Treat 409 as an error indicating the email is already taken
                            observer.next({ emailNotUnique: true });
                        } else if (error.status === 400) {
                            // 400 Bad Request - invalid email format
                            observer.next({ invalidEmail: true });
                        } else if (error.status === 500) {
                            // Server error
                            observer.next({ serverError: true });
                        } else {
                            // Unknown errors
                            observer.next({ unknownError: true });
                        }
                        observer.complete(); 
                    }
                );
            });
        };
    }




    // If lastname or firstname is entered, the other is required too
    namesConditionalValidator(g: FormGroup) {
        const firstName = g.get('firstName');
        const lastName = g.get('lastName');
        
        if (firstName?.value?.length == 0 && firstName?.value?.length == 0 ) {
            firstName?.setErrors(null)
            lastName?.setErrors(null)
        }

        if (firstName?.value && !lastName?.value) {
            lastName?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^\S(.*\S)?$/)]);
            lastName?.setErrors({required:true});
        } else if (!firstName?.value && lastName?.value) {
            firstName?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^\S(.*\S)?$/)]);
            firstName?.setErrors({required:true});
        } else {
            firstName?.setValidators([Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^\S(.*\S)?$/)]);
            lastName?.setValidators([Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^\S(.*\S)?$/)]);
        }
        //
        // firstName?.updateValueAndValidity({ onlySelf: true });
        // lastName?.updateValueAndValidity({ onlySelf: true });
        // firstName?.markAsTouched();
        // lastName?.markAsTouched();

        return null;
    }

    fullNameAsyncValidator(): AsyncValidatorFn {
        
        return (control: AbstractControl): Observable<any> => {
            if (!control.value) {
                return of(null);
            }
            const firstNameControl = this.signupForm.get('firstName');
            const lastNameControl = this.signupForm.get('lastName');

            // Check if either firstName or lastName has a value
            if (!firstNameControl?.value && !lastNameControl?.value) {
                return of(null); // No need to validate if both are empty
            }

            const fullName = `${firstNameControl?.value || ''} ${lastNameControl?.value || ''}`;

            if (!fullName.trim()) {
                return of(null);
            }

            return new Observable((observer) => {
                this.userService.areNamesUnique(fullName).subscribe(
                    (response: any) => {
                        if (response === true) {
                            // Not a good practise but shouldn't be a problems, in the worst case, the backend has a validation
                            lastNameControl?.setErrors(null);
                            firstNameControl?.setErrors(null);
                            observer.next(null);
                        }
                        observer.complete();
                    },
                    (error) => {
                        switch (error.status) {
                            case 409:
                                observer.next({ fullNameNotUnique: true });
                                break;
                            case 400:
                                observer.next({ invalidFullname: true });
                                break;
                            default:
                                observer.next({ unknownError: true });
                        }
                        observer.complete();
                    }
                );
            });
        };
    }


    // Custom validator to ensure the user is within the age range
    ageValidator(min: number, max: number) {
        return (control: AbstractControl) => {
            const birthDate = new Date(control.value);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const isAgeValid = age >= min && age <= max;

            return isAgeValid ? null : { invalidAge: true };
        };
    }
    
    passwordMatchValidator(g: FormGroup) {
        const password = g.get('password');
        const confirmPassword = g.get('confirmPassword');

        if (password && confirmPassword) {
            return password.value === confirmPassword.value ? null : { mismatch: true };
        }

        return { mismatch: true };
    }
    
    onSubmit() {
        
        if (this.signupForm.valid) {
                let formUser = new User(this.signupForm.value);
                if (formUser.firstName =="")
                    formUser.firstName = undefined;
                if (formUser.lastName =="")
                    formUser.lastName = undefined;
                formUser.role= Role.User;
                this.userService.saveUser(formUser).subscribe(
                    (response: any) => {
                        if (response === true) {
                            this.authenticationService.login(formUser.email!, formUser.password!)
                                .subscribe({
                                    // si login est ok, on navigue vers la page demandée
                                    next: data => {
                                        this.router.navigate(['/home']);
                                    },
                                    error: error => {
                                        console.log(error);
                                        this.router.navigate(['unknown']);
                                    }
                                });
                        }
                    }
                )
        } else {
            // Log all form control errors
            Object.keys(this.signupForm.controls).forEach(controlName => {
                const control = this.signupForm.get(controlName);
                const emailControl = this.signupForm.get('email');
                emailControl?.updateValueAndValidity();
                console.log(`${controlName} errors:`, control?.errors);
            });
        }
    }


    goBack() {
        this.router.navigate(['']);
    }
}
