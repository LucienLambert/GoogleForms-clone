import {Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {Location} from '@angular/common';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
    @Output() searchEvent = new EventEmitter<string>(); // Emits search input to parent
    @Output() saveEvent = new EventEmitter<void>();

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    @Input() title: string = '<undefined>';
    @Input() searchVisible: boolean = false;
    @Input() isSaveVisible: boolean = false;
    @Input() isSearchVisible: boolean = false;
    @Input() isAddVisible: boolean = false;
    @Input() backButtonVisible: boolean = false;
    @Input() saveDisabled: boolean = true;

    constructor(private router: Router, private _location: Location) {
    }

    toggleSearch() {
        if (this.searchVisible) {
            this.searchEvent.emit('');
            if (this.searchInput) {
                this.searchInput.nativeElement.value = '';
            }
        }
        this.searchVisible = !this.searchVisible;
    }

    onSearchChange(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        this.searchEvent.emit(inputElement.value);
    }
    
    createForm() {
        this.router.navigate(['create-edit-form']);
    }
    
    onSave() {
        this.saveEvent.emit();
    }
    
    backClicked() {
        this._location.back();
    }
}
