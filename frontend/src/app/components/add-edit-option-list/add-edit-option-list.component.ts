import {Component, OnInit} from '@angular/core';
import {OptionList} from "../../models/optionList";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {AuthenticationService} from "../../services/authentication.service";
import {UserService} from "../../services/user.service";
import {FormService} from "../../services/form.service";
import {BehaviorSubject, Observable, of, switchMap, take} from "rxjs";
import {catchError, filter, map} from "rxjs/operators";
import {User} from "../../models/user";
import {ModalDialogComponent} from "../modal-dialog/modal-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {OptionValue} from "../../models/optionValue";

@Component({
  selector: 'app-add-edit-option-list',
  templateUrl: './add-edit-option-list.component.html',
  styleUrl: './add-edit-option-list.component.css'
})
export class AddEditOptionListComponent implements OnInit {
  
  navBarTitle: string = 'Create New Option List';
  backButtonVisible: boolean = true;
  addOptionDisabled: boolean = true;
  isAnyOptionSelected = false;

  optionList?: OptionList;
  private originalOptionList!: any;
  form!: FormGroup;
  ownerLoaded = new BehaviorSubject<User | null>(null);

  constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService, private formService: FormService,
              private userService: UserService, private modalDialog : MatDialog) {}

  ngOnInit(): void {
    this.BindReactiveForm();
    this.loadOptionList();
  }
  
  BindReactiveForm(){
    this.form = this.formBuilder.group({
      id: [0],
      name: ['', [Validators.required]],
      ownerId: [null],
      optionValues: this.formBuilder.array([]),
      newOption: ['']
    });
  }

  loadOptionList() {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = Number(idParam);
        if (!isNaN(id)) {
          this.userService.getUserOptionList(id).subscribe(optionList => {
            this.optionList = optionList;
            this.originalOptionList = JSON.parse(JSON.stringify(optionList));
            this.navBarTitle = "Edit Option List";

            // Clear existing FormArray if any
            const optionArray = this.form.get('optionValues') as FormArray;
            optionArray.clear(); // Clear old values

            // Initialize the FormArray with 'false' (unchecked) for each option
            this.optionList.listOptionValues?.forEach(() => {
              optionArray.push(this.formBuilder.control(false));  // Default value to false (unchecked)
            });

            // Patch the form values (excluding the optionValues)
            this.form.patchValue({
              id: this.optionList.id,
              name: this.optionList.name,
              ownerId: this.optionList.ownerId
            });
          });
        }
      }
    });
  }

  getControl(index: number): FormControl {
    const optionArray = this.form.get('optionValues') as FormArray;
    return optionArray.at(index) as FormControl;
  }

  uniqueTitleValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value) {
      return of(null);
    }

    const formId = Number(this.route.snapshot.paramMap.get('id'));

    return this.ownerLoaded.pipe(
        filter((owner) => !!owner),
        take(1),
        switchMap((owner) => {
          const ownerId = owner!.id;
          return this.formService.isTitleUnique(control.value, ownerId, formId);
        }),
        map((isUnique) => (isUnique ? null : { unique: true })),
        catchError(() => of(null))
    );
  }
  
  addOption(){
    // 1. Retrieve entered value in field
    const newOptionValue = this.form.get('newOption')?.value.trim();
    if(!newOptionValue) { return }

    // 2. Add to the displayed list (not saved to server yet)
    this.optionList?.listOptionValues?.push({idx: 0, optionListId: this.optionList?.id, value: newOptionValue });

    // 3. Add a corresponding checkbox control
    const optionarray = this.form.get('optionValues') as FormArray;
    optionarray.push(this.formBuilder.control(false));

    // 4. Clear the newOption field
    this.form.patchValue({ newOption: '' });

    // 5. Optionally disable the add button again if you’re controlling that in code
    this.addOptionDisabled = true;
  }
  
  onSave(){
    console.log(this.optionList);
    this.userService.saveOptionList(this.optionList!).subscribe({
      next: (success) => {
        if (success) {
          this.router.navigate(['/manage-option-lists']);
        }
      }
    });
  }
  
  onCancel(){
    // Restore the original option list
    this.optionList = JSON.parse(JSON.stringify(this.originalOptionList));

    // Clear and reinitialize the FormArray
    const optionArray = this.form.get('optionValues') as FormArray;
    optionArray.clear();

    // Add a checkbox control for each original option
    this.optionList!.listOptionValues?.forEach(() => {
      optionArray.push(this.formBuilder.control(false));
    });

    // Reset form values (name and newOption)
    this.form.patchValue({
      name: this.optionList!.name,
      newOption: ''
    });

    // Reset any selection or additional states
    this.isAnyOptionSelected = false;
    this.addOptionDisabled = true;
  }
  
  onNewOptionChange(){
    const newOptionValue = this.form.get("newOption")?.value;
    this.addOptionDisabled = !newOptionValue.trim();
  }

  onOptionSelectChange(opt: any) {
    const optionArray = this.form.get('optionValues') as FormArray;
    this.isAnyOptionSelected = optionArray.controls.some(control => control.value === true);
  }

  onDeleteSelectedOptions() {
    const selectedOptions = this.optionList!.listOptionValues!.filter((_, index) => {
      const control = this.form.get('optionValues')!.get(index.toString()) as FormControl;
      return control.value === true;
    }).map(option => option.idx);
    
    this.optionList?.listOptionValues;
  }
  
  onCancelSelection(){
    const optionArray = this.form.get('optionValues') as FormArray;
    optionArray.controls.forEach(control => {
      control.setValue(false);
    })
    
    this.isAnyOptionSelected = false;
  }
}
