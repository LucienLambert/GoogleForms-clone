import {Component, OnInit} from '@angular/core';
import {OptionList} from "../../models/optionList";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "../../services/authentication.service";
import {UserService} from "../../services/user.service";
import {BehaviorSubject, Observable, tap} from "rxjs";
import {Role, User} from "../../models/user";
import {OptionValue} from "../../models/optionValue";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";

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
  changesNotSaved: boolean = false;
  isLoading: boolean = false;

  optionList?: OptionList;
  private originalOptionList!: any;
  form!: FormGroup;
  ownerLoaded = new BehaviorSubject<User | null>(null);
  userRole?: string;
  owner?: User;
  optionArray?: FormArray;

  constructor(private router: Router, private route: ActivatedRoute, private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService, private userService: UserService) {}

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
              this.formBuilder.control(false)), [this.minLengthArrayValidator(1)]),
      newOption: ['', [Validators.minLength(3), this.duplicateOptionValidator()]],
      isSystem: [false],
    });
    
    this.optionArray = this.form.get('optionValues') as FormArray;
  }

  private SaveDisablingLogic() {
    this.form.statusChanges.subscribe(() => {
      this.detectChanges();
    });
    this.form.valueChanges.subscribe(() => {
      this.detectChanges();
    });
  }

  private LoadOptionList() {
    this.route.paramMap.subscribe(params => {
      this.route.queryParamMap.subscribe(queryParams => {
        const isDuplicate = queryParams.get('duplicate') === 'true';

        const idParam = params.get('id');
        if (idParam) {
          const id = Number(idParam);
          if (!isNaN(id)) {
            // Force a fresh fetch to avoid using stale data
            this.userService.getUserOptionList(id, true).subscribe(optionList => {
              this.optionList = optionList;
              this.originalOptionList = JSON.parse(JSON.stringify(optionList));
              this.navBarTitle = "Edit Option List";

              // Clear existing FormArray if any
              this.optionArray!.clear();

              // Initialize the FormArray with 'false' (unchecked) for each option
              this.optionList.listOptionValues?.forEach(() => {
                this.optionArray!.push(this.formBuilder.control(false));
              });

              // Patch the form values (excluding the optionValues)
              this.form.patchValue({
                id: this.optionList.id,
                name: this.optionList.name,
                ownerId: this.optionList.ownerId,
                isSystem: !this.optionList.ownerId
              });

              if (isDuplicate) {
                this.optionList.id = 0;
                this.form.patchValue({ id: 0 })
                if (this.owner?.role == Role.Admin) {
                  this.optionList.ownerId = undefined;
                  this.form.patchValue({ ownerId: undefined })
                } else {
                  this.form.patchValue({ ownerId: this.owner!.id })
                  this.optionList.ownerId = this.owner!.id;
                }
              }
            });
          }
        }
      });
    });
  }

  getControl(index: number): FormControl {
    const optionArray = this.form.get('optionValues') as FormArray;
    return optionArray.at(index) as FormControl;
  }

  private duplicateOptionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // If empty, no error
      if (!control.value) {
        return null;
      }

      // Compare user input vs. existing items in your array
      const newValue = control.value.trim().toLowerCase();
      const isDuplicate = this.optionList?.listOptionValues?.some(
          ov => ov.value.trim().toLowerCase() === newValue
      );

      // Return { duplicate: true } if found, else null
      return isDuplicate ? { duplicate: true } : null;
    };
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
      this.isLoading = true;
      // Update optionList with form values
      this.optionList = {
        ...this.form.getRawValue(),
        listOptionValues: this.optionList!.listOptionValues // Preserve existing options
      };
      
      if (this.form.get('isSystem')?.value == false) {
        this.optionList!.ownerId = this.owner?.id;
      }

      // Save to backend
      this.userService.saveOptionList(this.optionList!).subscribe({
        next: (data) => {
          this.isLoading = false;
          if(history.state?.previousUrl == '/create-edit-question'){
            data.notReferenced = true;
            history.state.redirectObject.optionList = data;
            this.router.navigate(['/create-edit-question'], {
              state: { redirectObject : history.state.redirectObject }
            });
          }else {
            this.router.navigate(['/manage-option-lists'], {
              state: { previousUrl : '/home' }
            });
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error saving:', err);
        }
      });
    } else {
      console.error('Form is invalid:', this.form);
    }
  }
  
  onSaveEvent(){
    this.onSave();
    this.userService.getUserOptionLists(this.owner?.id!);
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

  onDeleteSelectedOptions() {
    // Identify indices of selected options
    const selectedIndices = this.optionArray!.controls
        .map((control, index) => (control.value ? index : -1)) // Mark selected controls with their index
        .filter(index => index !== -1); // Filter out unselected controls

    // Remove options from `listOptionValues` using the selected indices
    this.optionList!.listOptionValues = this.optionList!.listOptionValues!.filter(
        (_, index) => !selectedIndices.includes(index)
    );

    // Clear and recreate FormArray controls after removal
    this.optionArray!.clear();
    this.optionList!.listOptionValues!.forEach(() => {
      this.optionArray!.push(this.formBuilder.control(false));
    });

    // Reset selection state
    this.isAnyOptionSelected = false;
  }

  onCancelSelection(){
    this.optionArray!.controls.forEach(control => {
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

  onOptionSelectChange() {
    this.isAnyOptionSelected = this.optionArray!.controls.some(control => control.value === true);
  }

  onDrop(event: CdkDragDrop<OptionValue[]>) {
    moveItemInArray(
        this.optionList!.listOptionValues!,
        event.previousIndex,
        event.currentIndex
    );
    
    this.optionList!.listOptionValues!.forEach((option, index) => {
      option.idx = index + 1;
    });

    this.detectChanges();
  }

  private isDataEqual(newData: OptionList, oldData: OptionList): boolean {
    // 1. Check the name
    if (newData === undefined || oldData === undefined) {
      return false;
    }
    
    if (newData.name !== oldData.name) {
      return false;
    }

    // 2. Compare length of listOptionValues
    if ((newData.listOptionValues?.length || 0) !== (oldData.listOptionValues?.length || 0)) { return false; }

    // 3. Compare each item (value + idx)
    for (let i = 0; i < newData.listOptionValues!.length; i++) {
      const newItem = newData.listOptionValues![i];
      const oldItem = oldData.listOptionValues![i];

      if (newItem.value !== oldItem.value) {
        return false;
      }

      // If you're using `idx` to track order
      if (newItem.idx !== oldItem.idx) {
        return false;
      }
    }

    // If all checks passed, they’re the same
    return true;
  }

  private detectChanges(): void {
    // If the form is invalid, we definitely disable “Save”
    if (this.form.invalid) {
      this.isSaveDisabled = true;
      this.changesNotSaved = false;
      return;
    }

    // Gather the current data from the form + your updated optionList
    const newData: OptionList = {
      ...this.form.getRawValue(),
      listOptionValues: this.optionList?.listOptionValues || []
    };

    // Compare it to the original
    const dataIsSame = this.isDataEqual(newData, this.originalOptionList);

    // If data is the same, changesNotSaved = false, so disable Save
    this.changesNotSaved = !dataIsSame;
    this.isSaveDisabled = dataIsSame;
  }

  updateAddOptionDisabled() {
    const newOptionCtrl = this.form.get('newOption');
    
    if (this.form.get('newOption')?.value !== '') {
      this.addOptionDisabled = !!newOptionCtrl?.errors;
    } else {
      this.addOptionDisabled = true;
    }
  }
}
