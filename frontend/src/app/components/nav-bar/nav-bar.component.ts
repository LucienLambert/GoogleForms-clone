import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Router} from "@angular/router";

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
    @Input() title: string = '<undefined>';
    @Output() searchEvent = new EventEmitter<string>(); // Emits search input to parent


    constructor(private router: Router) {
    }

    onSearchChange(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        this.searchEvent.emit(inputElement.value);
    }
}
