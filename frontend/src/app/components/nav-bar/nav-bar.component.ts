import {Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {Location} from '@angular/common';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
    @Output() searchEvent = new EventEmitter<string>(); // Emits search input to parent
    @Output() saveEvent = new EventEmitter<void>();
    @Output() backButtonEvent = new EventEmitter<void>();
    

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    @Input() title?: string;
    @Input() searchVisible: boolean = false;
    @Input() isSaveVisible: boolean = false;
    @Input() isSearchVisible: boolean = false;
    @Input() isAddVisible: boolean = false;
    @Input() backButtonVisible: boolean = false;
    @Input() saveDisabled: boolean = true;
    @Input() analyseVisible: boolean = false;

    constructor(private router: Router, private _location: Location, private authService : AuthenticationService) {
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
        this.backButtonEvent.emit();
        this._location.back();
    }


    logout(){
        this.authService.logout();
        this.router.navigate(['/login']);
    }
    
    analyse() {
        this.router.navigate(['analyse']);

    }
}
