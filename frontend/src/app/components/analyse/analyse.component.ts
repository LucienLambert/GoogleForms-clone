import { Component, OnInit } from '@angular/core';
import { FormService } from '../../services/form.service';
import { Question } from '../../models/question';
import { ActivatedRoute, Router } from '@angular/router';
import { Form } from '@angular/forms';

@Component({
    selector: 'app-analyse',
    templateUrl: './analyse.component.html',
    styleUrls: ['./analyse.component.css']
})
export class AnalyseComponent implements OnInit {
    questions: Question[] = [];
    selectedQuestion: number | null = null;
    statistics: { answer: string; count: number; ratio: number }[] = [];
    viewInstancesVisible : boolean = true; 
    formId?: number;

    constructor(private formService: FormService, private route: ActivatedRoute, private router : Router) {}

    ngOnInit(): void {
        this.formId = Number(this.route.snapshot.paramMap.get('id'));
        this.retrieveQuestions();
    }

    retrieveQuestions() {
        if (this.formId != undefined) {

            this.formService.getFormQuestions(this.formId).subscribe((data: Question[]) => {
                this.questions = data;
                if (this.questions.length > 0) {
                    this.selectedQuestion = this.questions[0].id;
                    this.loadStatistics(this.selectedQuestion);
                }
            });
        }
    }

    onQuestionChange(): void {
        if (this.selectedQuestion !== null) {
            this.loadStatistics(this.selectedQuestion);
        }
    }

    loadStatistics(questionId: number): void {
        const selectedQuestion = this.questions.find(q => q.id === questionId);

        if (selectedQuestion) {
            const answerCounts = new Map<string, number>();

            selectedQuestion.answersList!.forEach(answer => {
                let answerValue = answer.value;

                // Check if the question has an OptionList and the answer is numeric
                if (selectedQuestion.optionList && !isNaN(+answerValue)) {
                    const optionValue = selectedQuestion.optionList.listOptionValues?.find(
                        ov => ov.idx === +answerValue
                    );

                    // Update answerValue to the corresponding string value if found
                    answerValue = optionValue ? optionValue.value : `Unknown (${answerValue})`;
                }
                answerCounts.set(answerValue, (answerCounts.get(answerValue) || 0) + 1);
            });

            const totalAnswers = selectedQuestion.answersList!.length;

            // Calculate statistics
            this.statistics = Array.from(answerCounts.entries()).map(([answer, count]) => ({
                answer,
                count,
                ratio: count / totalAnswers
            }));

            console.log('Updated Statistics:', this.statistics);
        } else {
            console.warn('No answers found for the selected question.');
            this.statistics = [];
        }
    }

    viewInstances() {
        this.router.navigate(['/view-instances', this.formId]);
    }
}
