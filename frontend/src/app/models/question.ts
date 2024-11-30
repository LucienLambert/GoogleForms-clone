import { Form } from './form';
import { OptionList } from './optionList' ;
enum questionType {
    text,
    number,
    date,
    boolean
}
export class Question {
    
    id: number;
    form: Form; 
    title: string;
    description?: string;
    questionType: questionType;
    required: boolean;
    optionList: OptionList;

    constructor(data: any) {
        this.id = data.id;
        this.form = data.form;
        this.title = data.title;
        this.description = data.description;
        this.questionType = data.questionType;
        this.required = data.required;
        this.optionList = data.optionList;
    }
}