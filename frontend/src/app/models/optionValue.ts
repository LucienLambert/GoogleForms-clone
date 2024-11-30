import { OptionList } from './optionList';
export class OptionValue {
    
    
    idx: number;
    optionList: OptionList;
    value: string;
    
    constructor(data:any) {
        
        this.idx = data.idx;
        this.optionList = data.optionList;
        this.value = data.value;
    }
    
}