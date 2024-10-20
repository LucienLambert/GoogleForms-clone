import {Component, Input} from '@angular/core';
import {Router} from "@angular/router";

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
    @Input() title: string = '<undefined>';
    
    constructor(private router: Router) {
    }
    
    
}
