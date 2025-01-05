import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { OptionList } from "src/app/models/optionList";
import { Question, QuestionType } from "src/app/models/question";
import { User } from "src/app/models/user";
import { AuthenticationService } from "src/app/services/authentication.service";
import { QuestionService } from "src/app/services/question.service";
import { UserService } from "src/app/services/user.service";

@Component({
    selector: "app-create-edit-question",
    templateUrl: "./create-edit-question.component.html",
    styleUrl: "./create-edit-question.component.css"
})
export class CreateEditQuestionComponent implements OnInit {
    
    questionForm! : FormGroup;
    question! : Question;
    questionTypes: string[] = Object.keys(QuestionType).filter(key => isNaN(Number(key)));
    optionList?: OptionList[];
    user?: User;

    navBarTitle? : string ;
    backButtonVisible : boolean = true;
    isSaveVisible : boolean = true;
    isSaveDisabled : boolean = false;
    showOptionList?: boolean;
    isAddVisible : boolean = true;

    constructor(private router: Router, private route: ActivatedRoute, private formBuilder : FormBuilder,
                private authenticationService: AuthenticationService, private questionService: QuestionService,
                private userService: UserService){
        this.user = this.authenticationService.currentUser;
    }

    ngOnInit() {
        // récup l'objet passer par le navigate "state"
        this.initializeQuestion();
    }

    // permet de créer une question vide ou de récupérer la question via le state
    initializeQuestion(){
        const state = history.state;
        if (state && state.question) {
            this.question = state.question;
            this.navBarTitle = 'Edit Question';
            this.isSaveDisabled = false;
            this.showOptionList = this.question.questionType.valueOf().toString() === 'Combo';
            console.log(this.showOptionList);
        } else {
            this.navBarTitle = 'Add a new Question';
            this.question = new Question({
                formId: state.formId,
                title: undefined,
                description: '',
                optionList: undefined,
                questionType: QuestionType.Short,
                required: false,
              });
        }
        this.getOptionList();
        this.createForm();
    }

    getOptionList(){
        this.userService.getUserOptionLists(this.user!.id).subscribe({
            next : (data) => {
                this.optionList = data;
            }
        });
    }

    createForm() {
        this.questionForm = this.formBuilder.group({
            title: [this.question.title, [Validators.required, Validators.minLength(3)]],
            description: [this.question.description,[Validators.minLength(3)]],
            questionType: [this.question.questionType, Validators.required],
            required: [this.question.required],
            optionList: [this.question.optionList]
        });
          
        this.questionForm.get('questionType')?.valueChanges.subscribe((value) => {
          this.showOptionList = value === 'Combo';
        });
    }

    onSave() {
        if(this.questionForm.valid){
            this.question = this.questionForm.value;
            // this.question.title = formData.title;
            // this.question.description = formData.description;
            // this.question.questionType = formData.questionType;
            // this.question.required = formData.required;
            // this.question.optionList = formData.optionList;
            console.log(this.question);
        } else {
            console.log("questionForm non valide");
        }
    }

    addOptionList() {
        this.router.navigate(['/manage-option-lists']);
    }
}