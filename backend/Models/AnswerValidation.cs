using FluentValidation;
using Microsoft.EntityFrameworkCore;
using prid_2425_a01.Models;
using System.Linq;

namespace prid_2425_a01.Models;

public class AnswerValidation : AbstractValidator<Answer>
{
    private readonly FormContext _context;
    private int dynamicCount;

    public AnswerValidation(FormContext context)
    {
        _context = context;

        RuleSet("Create", () =>
        {
            RuleFor(a => a.Idx)
                .Must((answer, idx) =>
                {
                    var question = _context.Questions.Find(answer.QuestionId);
                    if (question == null) return false;

                    if (question.QuestionType != QuestionType.Check)
                    {
                        return idx == 0;
                    }
                    else
                    {
                        if (idx <= 0) return false;

                        var existingAnswers = _context.Answers
                            .Where(a => a.InstanceId == answer.InstanceId && a.QuestionId == answer.QuestionId)
                            .OrderBy(a => a.Idx)
                            .ToList();

                        if (!existingAnswers.Any()) return idx == 1;

                        return idx == existingAnswers.Count +1;
                    }
                })
                .WithMessage("The index must be 0 for all question types except for Check, otherwise, it must be incremented starting from 1.");

            RuleFor(a => a.Value)
                .Must((answer, value) =>
                {
                    var question = _context.Questions.Find(answer.QuestionId);
                    if (question == null) return false;

                    if (question.Required)
                    {
                        return !string.IsNullOrWhiteSpace(value);
                    }
                    return true;
                })
                .WithMessage("The value mustn't be empty or contain spaces if the question is required.");

            RuleFor(a => a.Value)
                .Must((answer, value) =>
                {
                    var question = _context.Questions
                        .Include(q => q.OptionList)
                        .ThenInclude(optionList => optionList.ListOptionValues)
                        .FirstOrDefault(q => q.Id == answer.QuestionId);
                    if (question == null || !(question.QuestionType == QuestionType.Check ||
                                              question.QuestionType == QuestionType.Combo ||
                                              question.QuestionType == QuestionType.Radio)) return true;

                    if (string.IsNullOrWhiteSpace(value)) return false;

                    if (question.OptionList == null)
                        return false;

                    return question.OptionList.ListOptionValues.Any(ov => ov.Idx.ToString() == value);
                })
                .WithMessage("The value must correspond to an index within the option list.");
        }); 
        
        
        
        
        
        
                RuleSet("Update", () =>
        {
            RuleFor(a => a.Idx)
                .Must((answer, idx) =>
                {
                    var question = _context.Questions.Find(answer.QuestionId);
                    if (question == null) return false;

                    if (question.QuestionType != QuestionType.Check)
                    {
                        return idx == 0;
                    }
                    else
                    {
                        if (idx <= 0) return false;

                        var existingAnswers = dynamicCount;
                        
                        return idx == existingAnswers +1;
                    }
                })
                .WithMessage("The index must be 0 for all question types except for Check, otherwise, it must be incremented starting from 1.");

            RuleFor(a => a.Value)
                .Must((answer, value) =>
                {
                    var question = _context.Questions.Find(answer.QuestionId);
                    if (question == null) return false;

                    if (question.Required)
                    {
                        return !string.IsNullOrWhiteSpace(value);
                    }
                    return true;
                })
                .WithMessage("The value mustn't be empty or contain spaces if the question is required.");

            RuleFor(a => a.Value)
                .Must((answer, value) =>
                {
                    var question = _context.Questions
                        .Include(q => q.OptionList)
                        .ThenInclude(optionList => optionList.ListOptionValues)
                        .FirstOrDefault(q => q.Id == answer.QuestionId);
                    if (question == null || !(question.QuestionType == QuestionType.Check ||
                                              question.QuestionType == QuestionType.Combo ||
                                              question.QuestionType == QuestionType.Radio)) return true;

                    if (string.IsNullOrWhiteSpace(value)) return false;

                    if (question.OptionList == null)
                        return false;

                    return question.OptionList.ListOptionValues.Any(ov => ov.Idx.ToString() == value);
                })
                .WithMessage("The value must correspond to an index within the option list.");
        }); 
    }
    public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(Answer answer) {
        return await this.ValidateAsync(answer, vs => vs.IncludeRuleSets("default", "Create"));
    }
    
    public async Task<FluentValidation.Results.ValidationResult> ValidateOnUpdate(Answer answer, int count) {
        dynamicCount = count;
        return await this.ValidateAsync(answer, vs => vs.IncludeRuleSets("default", "Update"));
    }
}