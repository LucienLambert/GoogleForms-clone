import {User} from "./user";

export class OptionList {

    id: number;
    name: string;
    owner?: User;

    constructor(data:any) {
        this.id = data.id;
        this.name = data.name;
        this.owner = data.owner;
    }
    
}