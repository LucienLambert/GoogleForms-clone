import {User} from "./user";
import {OptionValue} from "./optionValue";
import {Question} from "./question";

export class OptionList {

    id: number;
    name: string;
    owner?: User;
    optionValues?: OptionValue[];

    constructor(data:any) {
        this.id = data.id;
        this.name = data.name;
        this.owner = data.owner;
        this.optionValues = data.listOptionValues ? data.listOptionValues.map( (ov: OptionValue) => new OptionValue(ov)) : [];
    }
    
}