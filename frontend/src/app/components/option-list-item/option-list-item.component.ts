import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {OptionList} from '../../models/optionList';
import {Role, User} from "../../models/user";

@Component({
  selector: 'app-option-list-item',
  templateUrl: './option-list-item.component.html',
  styleUrls: ['./option-list-item.component.css']
})
export class OptionListItemComponent {

  @Input() owner?: User;
  @Input() optionList!: OptionList; 
  @Output() edit = new EventEmitter<OptionList>();
  @Output() delete = new EventEmitter<OptionList>();
  @Output() duplicate = new EventEmitter<OptionList>();
  
  editDisabled: boolean = true;
  deleteDisabled: boolean = true;

  ngOnInit() {
    this.updateDisabledState();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['owner'] || changes['optionList']) {
      this.updateDisabledState();
    }
  }

  private updateDisabledState() {
    if (this.owner?.role === Role.Admin && this.optionList.ownerId === null || this.optionList.notReferenced) {
      this.activateEditAndDelete();
    }
  }
  
  activateEditAndDelete(){
    this.editDisabled = false;
    this.deleteDisabled = false;
  }
  
  get displayTitle(): string {
    return this.optionList.ownerId ? this.optionList.name : `${this.optionList.name} (System)`;
  }

  onEdit() {
    this.edit.emit(this.optionList);
  }

  onDelete() {
    this.delete.emit(this.optionList);
  }

  onDuplicate() {
    this.duplicate.emit(this.optionList);
  }
}
