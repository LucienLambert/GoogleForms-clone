import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OptionList } from '../../models/optionList';

@Component({
  selector: 'app-option-list-item',
  templateUrl: './option-list-item.component.html',
  styleUrls: ['./option-list-item.component.css']
})
export class OptionListItemComponent {
  
  @Input() optionList!: OptionList; 
  @Output() edit = new EventEmitter<OptionList>();
  @Output() delete = new EventEmitter<OptionList>();
  @Output() duplicate = new EventEmitter<OptionList>();
  
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
