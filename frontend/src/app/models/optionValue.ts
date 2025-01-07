import { OptionList } from './optionList';
export class OptionValue {
    
    
    idx: number;
    optionListId: number;
    optionList?: OptionList;
    value: string;
    
    constructor(data:any) {
        this.idx = data.idx;
        this.optionListId = data.optionListId;
        this.optionList = data.optionList;
        this.value = data.value;
    }
}