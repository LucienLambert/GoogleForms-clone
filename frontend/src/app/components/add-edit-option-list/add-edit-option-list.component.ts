import {Component, OnInit} from '@angular/core';
import {OptionList} from "../../models/optionList";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {AuthenticationService} from "../../services/authentication.service";
import {UserService} from "../../services/user.service";
import {FormService} from "../../services/form.service";
import {BehaviorSubject, Observable, of, switchMap, take} from "rxjs";
import {catchError, filter, map} from "rxjs/operators";
import {User} from "../../models/user";

@Component({
  selector: 'app-add-edit-option-list',
  templateUrl: './add-edit-option-list.component.html',
  styleUrl: './add-edit-option-list.component.css'
})
export class AddEditOptionListComponent implements OnInit {
  
  navBarTitle: string = 'Create New Option List';
  backButtonVisible: boolean = true;

  optionList?: OptionList;
  form!: FormGroup;
  ownerLoaded = new BehaviorSubject<User | null>(null);

  constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService, private formService: FormService,
              private userService: UserService) {}

  ngOnInit(): void {
    this.BindReactiveForm();
  }
  
  BindReactiveForm(){
    this.form = this.formBuilder.group({
      id: null,
      title: ['', [Validators.required, Validators.minLength(3)], [this.uniqueTitleValidator.bind(this)]],
      description: ['', Validators.minLength(3)],
      owner: ['', Validators.required],
      isPublic: [false]
    });
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
