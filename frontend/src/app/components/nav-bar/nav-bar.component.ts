import {Component, Input, Output, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Router} from "@angular/router";

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
    @Input() title: string = '<undefined>';
    @Output() searchEvent = new EventEmitter<string>(); // Emits search input to parent

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
    searchVisible: boolean = false;

    constructor(private router: Router) {
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
}
