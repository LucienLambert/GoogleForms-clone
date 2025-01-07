import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { values } from "lodash-es";
import { catchError, map, Observable, of } from "rxjs";
import { Form } from "src/app/models/form";
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
    form?: Form;

    navBarTitle? : string ;
    backButtonVisible : boolean = true;
    isSaveVisible : boolean = true;
    isSaveDisabled : boolean = true;
    showOptionList?: boolean;
    // isAddVisible : boolean = true;
    previousUrl: string | null = null;

    constructor(private router: Router, private route: ActivatedRoute, private formBuilder : FormBuilder,
                private authenticationService: AuthenticationService, private questionService: QuestionService,
                private userService: UserService){
        this.user = this.authenticationService.currentUser;

    }

    ngOnInit() {
        const state = history.state;
        this.previousUrl = state?.previousUrl ?? '/home';
        console.log(this.previousUrl)
        // initialise la question en fonction de si c'est edit or creat question
        this.initializeQuestion(state);

    }

    // permet de créer une question vide ou de récupérer la question via le state
    initializeQuestion(state: any){
        // récup l'objet passer par le navigate "state"
        if (state && state.question) {
            this.question = state.question;
            this.navBarTitle = 'Edit Question';
            this.isSaveDisabled = false;
            //passe à true visible optionList si type === check or combo
            this.showOptionList = ['Combo', 'Check', 'Radio'].includes(this.question.questionType.toString());
            this.form = this.question.form;
        } else {
            this.navBarTitle = 'Add a new Question';
            this.question = new Question({
                id: 0,
                idx: 0,
                form: state.form,
                formId: state.form.id,
                title: '',
                description: '',
                optionList: null,
                optionListId: null,
                required: false,
              });
            this.form = state.form;
        }
        this.getOptionList();
        this.createForm();
    }

    //récup l'ol du owner et du systeme
    getOptionList(){
        this.userService.getUserOptionLists(this.question.form.ownerId).subscribe({
            next : (data) => {
                this.optionList = data;
            }
        });
    }

    createForm() {
        /*
        id;form;idx;title;description;type;required;option_list
        1;1;1;Your last name?;Your last name;short;1;
        */
        this.questionForm = this.formBuilder.group({
            id: [this.question.id],
            idx: [this.question.idx],
            formId:[this.question.formId],
            title: [this.question.title, [Validators.required, Validators.minLength(3)], [this.uniqueTitleValidator.bind(this)]],
            description: [this.question.description,[Validators.minLength(3)]],
            questionType: [this.question.questionType, [Validators.required]],
            // optionListId: [this.question.optionList?.id],
            optionList: [this.question.optionList],
            required: [this.question.required] 
        });
        this.changeValueOptionListQuestion();
    }

    //permet de changer reset le valeur de l'optionList en cas de changement de questionType
    //pour éviter la conservation de l'option list dans question apres le changement de typage de la question
    changeValueOptionListQuestion () {
        // subscribe pour gérer le changement de type questionType
        this.questionForm.get('questionType')?.valueChanges.subscribe((value) => {
            this.showOptionList = (value === 'Combo' || value === 'Check' || value == 'Radio');
            const optionListControl = this.questionForm.get('optionList');
            if (value === 'Combo' || value === 'Check' || value == 'Radio') {
            optionListControl?.setValidators([Validators.required]);
            } else {
            optionListControl?.clearValidators();
            optionListControl?.setValue(null);
            }
            optionListControl?.updateValueAndValidity();
        });
        //permet de passer le bouton save visible si le questionForm est complet
        this.questionForm.statusChanges.subscribe((status) => {
            this.isSaveDisabled = status !== 'VALID';
        });           
    }
    //permet l'affichage du nom de l'option2 en la comparant à la liste d'option1
    compareOptionLists(option1: OptionList, option2: OptionList): boolean {
        return option1 && option2 ? option1.id === option2.id : option1 === option2;
    }

    //bouton save pour crée ou éditer une question
    onSave() {
        if(this.questionForm.valid){
            this.question = this.questionForm.value;
            const formValue = this.questionForm.value;
            // premet de copié toutes les value de formValue apres Conversion de string à enum et récupération de optionListId
            const questionToSend = {
                ...formValue,
                questionType: QuestionType[formValue.questionType as keyof typeof QuestionType],
                optionListId: formValue.optionList ? formValue.optionList.id : null,
            };
            //if(id == 0) alors c'est une nouvelle question et on appel createQuestion
            if(this.question.id == 0){
                this.questionService.createQuestion(questionToSend).subscribe({
                    next : (res) => {
                        this.router.navigate(['/view-form', this.question.formId], {
                            state: { previousUrl: '/home' }
                        });
                        // this.router.navigate(['view-form', this.question.formId]);
                    },
                });
            } else {
                this.questionService.updateQuestion(questionToSend).subscribe({
                    next : (res) => {
                        this.router.navigate(['/view-form', this.question.formId], {
                            state: { previousUrl: '/home' }
                        });
                    }
                })
            }

            
        } else {
            console.log("questionForm non valide");
        }
    }

    addOptionList() {
        this.router.navigate(['/manage-option-lists']);
    }

    editOptionList(){
        console.log("editOptionList");
    }


    uniqueTitleValidator(control: AbstractControl) : Observable<ValidationErrors | null> {
        if(!control.value){
            return of(null);
        }
        return this.questionService.isTitleUnique(control.value, this.question.formId, this.question.id)
            .pipe(
              map((isUnique) => (isUnique ? null : { unique: true })),
              catchError(() => of(null)));
    }

    //si optionList est référencé sur une question || optionList.ownerId != currentUser.id alors disable editOptionList
    //si currentUser.id != de currentUser.id alors disable addOptionList

}