import {Component, OnInit} from '@angular/core';
import {OptionList} from "../../models/optionList";
import {FormGroup} from "@angular/forms";

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

  ngOnInit(): void {
  }
}
