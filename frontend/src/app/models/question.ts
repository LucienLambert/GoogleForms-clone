import { Form } from './form';
import { OptionList } from './optionList' ;
export enum QuestionType {
    Short,
    Long,
    Date,
    Email,
    Integer,
    Check,  // le seul qui permette à l'utilisateur de choisir plusieurs valeurs.
    Combo,
    Radio
}
export class Question {
    
    id: number;
    form: Form; 
    title: string;
    description?: string;
    questionType: QuestionType;
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