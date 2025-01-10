import { Form } from './form';
import { OptionList } from './optionList' ;
import {User} from "./user";
import {OptionValue} from "./optionValue";
import {Answer} from "./answer";
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
    idx: number;
    formId: number;
    form: Form; 
    title: string;
    description?: string;
    questionType: QuestionType;
    required: boolean;
    optionListId?: number;
    optionList?: OptionList;
    answersList?: Answer[];

    constructor(data: any) {
        this.id = data.id;
        this.idx = data.idx;
        this.formId = data.formId;
        this.form = data.form;
        this.title = data.title;
        this.description = data.description;
        this.questionType = data.questionType;
        this.required = data.required;
        this.optionListId = data.optionListId;
        this.optionList = data.optionList ? new OptionList(data.optionList) : undefined;
        this.answersList = data.answersList ? data.answersList.map((a: any) => new Answer(a)) : undefined;
    }

    toString(): string {
        return `Question {
        id: ${this.id},
        idx: ${this.idx},
        form: ${this.form ? this.form.toString() : 'undefined'},
        title: "${this.title}",
        description: "${this.description || ''}",
        questionType: ${QuestionType[this.questionType]},
        required: ${this.required},
        optionList: ${this.optionList ? this.optionList.toString() : 'undefined'}
        }`;
    }
}