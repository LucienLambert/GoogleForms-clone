import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {Location} from "@angular/common";
import {AuthenticationService} from "../../services/authentication.service";
import {UserService} from "../../services/user.service";
import {User} from "../../models/user";
import { OptionList } from '../../models/optionList';

@Component({
    selector: 'app-manage-option-lists',
    templateUrl: './manage-option-lists.component.html',
    styleUrl: './manage-option-lists.component.css'
})
export class ManageOptionsListComponent implements OnInit {
    owner?: User;
    optionLists: OptionList[] = [];

    backButtonVisible: boolean = true;
    
    constructor(private router: Router, private _location: Location, private authenticationService: AuthenticationService,
                private userService: UserService) {
    }
    
    ngOnInit() {
        this.retrieveOptionLists();
    }
    
    retrieveOptionLists(){
        this.fetchOwnerData();

        this.userService.getUserOptionLists(1).subscribe({
            next: (data) => {
                this.optionLists = data;
            },
            error: (err) => {
                console.error('Failed to fetch option lists:', err);
            }
        })
    }

    fetchOwnerData(): void {
        const userId = this.authenticationService.getCurrentUser()?.id;
        this.userService.getUserById(userId!).subscribe({
            next: (owner) => {
                this.owner = owner;
            },
            error: (err) => {
                console.error('Error fetching owner data:', err);
            }
        });
    }

    onEdit(optionList: OptionList) {
        console.log('Edit clicked for:', optionList);
    }

    onDelete(optionList: OptionList) {
        console.log('Delete clicked for:', optionList);
    }

    onDuplicate(optionList: OptionList) {
        console.log('Duplicate clicked for:', optionList);
    }

    onAdd() {
        console.log('Add option list clicked');
    }
}