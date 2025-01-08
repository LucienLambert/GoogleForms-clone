import {Component, OnInit} from '@angular/core';
import {OptionList} from "../../models/optionList";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors, ValidatorFn,
  Validators
} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {AuthenticationService} from "../../services/authentication.service";
import {UserService} from "../../services/user.service";
import {FormService} from "../../services/form.service";
import {BehaviorSubject, Observable, of, switchMap, take, tap} from "rxjs";
import {catchError, filter, map} from "rxjs/operators";
import {Role, User} from "../../models/user";
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
  isSaveDisabled: boolean = true;
  isSystemCheckboxVisible: boolean = false;

  optionList?: OptionList;
  private originalOptionList!: any;
  form!: FormGroup;
  ownerLoaded = new BehaviorSubject<User | null>(null);
  userRole?: string;
  owner?: User;

  constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService, private formService: FormService,
              private userService: UserService, private modalDialog : MatDialog) {}

  ngOnInit(): void {
    this.BindReactiveForm();
    this.fetchOwnerData().subscribe({
      next: () => {
        this.LoadOptionList();
        this.SaveDisablingLogic();
        this.Admin();
      },
      error: (err) => {
        console.error('Error fetching owner data:', err);
      }
    });
  }

  Admin(){
    this.userRole = this.authenticationService.getRoleFromToken();
    if (this.userRole === 'Admin') {
      this.isSystemCheckboxVisible = true;
    }
  }

  fetchOwnerData(): Observable<User> {
    const userId = this.authenticationService.getUserIdFromToken();
    return this.userService.getUserById(userId!).pipe(
        tap(owner => {
          this.owner = owner;
          this.ownerLoaded.next(owner);
        })
    );
  }
  
  BindReactiveForm() {
    this.optionList = {
      id: 0,
      name: '',
      ownerId: undefined,
      listOptionValues: []
    };

    this.form = this.formBuilder.group({
      id: [this.optionList.id],
      name: [this.optionList.name, [Validators.required, Validators.minLength(3)]],
      ownerId: [this.optionList.ownerId],
      optionValues: this.formBuilder.array(
          this.optionList.listOptionValues!.map(() =>
              this.formBuilder.control(false)
          ),
          [this.minLengthArrayValidator(1)]
      ),
      newOption: [''],
      isSystem: [false],
    });
  }

  private SaveDisablingLogic(){
    this.form.statusChanges.subscribe((status) => {
      this.isSaveDisabled = status !== 'VALID';
    });
  }

  private LoadOptionList() {
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

  onSave() {
    if (this.form.valid) {
      // Update optionList with form values
      this.optionList = {
        ...this.form.getRawValue(),
        listOptionValues: this.optionList!.listOptionValues // Preserve existing options
      };
      
      console.log("onSave : " + this.owner?.id);
      if (this.form.get('isSystem')?.value == false) {
        this.optionList!.ownerId = this.owner?.id;
      }

      console.log('Saving OptionList:', this.optionList);

      // Save to backend
      this.userService.saveOptionList(this.optionList!).subscribe({
        next: (data) => {
          // console.log(data);
          if(history.state?.previousUrl == '/create-edit-question'){
            history.state.redirectObject.optionList = data;
            
            this.router.navigate(['/create-edit-question'], {
              state: { redirectObject : history.state.redirectObject }
            });
          }else {
            this.router.navigate(['/manage-option-lists']);
          }
        },
        error: (err) => console.error('Error saving option list:', err)
      });
    } else {
      console.error('Form is invalid:', this.form);
    }
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

  onDeleteSelectedOptions() {
    const optionArray = this.form.get('optionValues') as FormArray;

    // Identify indices of selected options
    const selectedIndices = optionArray.controls
        .map((control, index) => (control.value ? index : -1)) // Mark selected controls with their index
        .filter(index => index !== -1); // Filter out unselected controls

    // Remove options from `listOptionValues` using the selected indices
    this.optionList!.listOptionValues = this.optionList!.listOptionValues!.filter(
        (_, index) => !selectedIndices.includes(index)
    );

    // Clear and recreate FormArray controls after removal
    optionArray.clear();
    this.optionList!.listOptionValues!.forEach(() => {
      optionArray.push(this.formBuilder.control(false)); // Reinitialize checkboxes
    });

    // Reset selection state
    this.isAnyOptionSelected = false;
  }

  onCancelSelection(){
    const optionArray = this.form.get('optionValues') as FormArray;
    optionArray.controls.forEach(control => {
      control.setValue(false);
    })
    
    this.isAnyOptionSelected = false;
  }

  private minLengthArrayValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formArray = control as FormArray;
      return formArray.length >= minLength ? null : { minLengthArray: { requiredLength: minLength, actualLength: formArray.length } };
    };
  }
}
