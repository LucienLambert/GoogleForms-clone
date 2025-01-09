import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';


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
            firstName: ['', [Validators.minLength(3), Validators.maxLength(50)]],
            lastName: ['', [Validators.minLength(3), Validators.maxLength(50)]],
            birthDate: ['', [Validators.required, this.ageValidator(18, 125)]],
            email: ['',
                [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,}$/)],
                [this.emailAsyncValidator()]
            ],
            password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
            confirmPassword: ['', Validators.required]
        }, {
            validator: [this.namesConditionalValidator, this.passwordMatchValidator],
            // Devrait être sur le champ "lastname, mais crash TODO: debug"
            asyncValidator: [this.fullNameAsyncValidator()]  
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
                    firstNameControl.markAsTouched(); // Marquer firstName comme touché
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




    // Cross-field validator to enforce the conditional requirement for firstName and lastName
    namesConditionalValidator(g: FormGroup) {
        const firstName = g.get('firstName');
        const lastName = g.get('lastName');

        if (firstName?.value && !lastName?.value) {
            lastName?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(50)]);
        } else if (!firstName?.value && lastName?.value) {
            firstName?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(50)]);
        } else {
            firstName?.setValidators([Validators.minLength(3), Validators.maxLength(50)]);
            lastName?.setValidators([Validators.minLength(3), Validators.maxLength(50)]);
        }

        firstName?.updateValueAndValidity({ onlySelf: true });
        lastName?.updateValueAndValidity({ onlySelf: true });

        return null;
    }

    fullNameAsyncValidator(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<any> => {
            const fullName = `${this.signupForm.get('firstName')?.value} ${this.signupForm.get('lastName')?.value}`;

            if (!fullName.trim()) {
                return of(null);
            }

            return new Observable((observer) => {
                this.userService.areNamesUnique(fullName).subscribe(
                    (response: any) => {
                        if (response === true) {
                            observer.next(null);  // Name is unique, no error
                        } else {
                            observer.next({ fullNameNotUnique: true });  // Name is not unique
                        }
                        observer.complete();
                    },
                    (error) => {
                        observer.next({ unknownError: true });  // Handle error from server
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
            console.log('Form Submitted:', this.signupForm.value);
        } else {
            console.log('Form is invalid');
            this.signupForm.markAllAsTouched();  

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
