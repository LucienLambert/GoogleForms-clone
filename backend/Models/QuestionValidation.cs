using FluentValidation;
using Microsoft.EntityFrameworkCore;

using prid_2425_a01.Models;

namespace prid_2425_a01.Models;

public class QuestionValidation : AbstractValidator<Question> {

    private readonly ApplicationDbContext _context;

    public QuestionValidation(ApplicationDbContext context) {
        
        _context = context;

        // idx doit être supérieur à 0
        RuleFor(q => q.Idx)
            .GreaterThan(0).WithMessage("Index (idx) doit être supérieur à 0.");

        // Couple idx unique by form
        RuleFor(q => q.Idx)
            .NotEmpty().WithMessage("Un Idx est requis")
            .MustAsync(BeUniqueIdxForForm).WithMessage("il existe déjà une question portant se idx pour ce form");

        // titre requis et min 3 caractères && couple titre unique by form
        RuleFor(q => q.Title)
            .NotEmpty().WithMessage("un titre est requis")
            .MinimumLength(3).WithMessage("Le titre doit faire min 3 caractères")
            .MustAsync(BeUniqueTitleForForm).WithMessage("il existe déjà une question portant se titre pour ce form");

        // description 3 caractères si pas null
        RuleFor(q => q.Description)
            .Must(description => string.IsNullOrEmpty(description) || description.Length >= 3)
            .WithMessage("La description doit être vide ou contenir au moins 3 caractères.");

        // option_list doit référencer une liste d'options si type vaut 'check', 'combo' ou 'radio', sinon doit être null.
        RuleFor(q => q.OptionList)
            .NotNull()
            .When(q => q.QuestionType == QuestionType.Check ||
                    q.QuestionType == QuestionType.Combo ||
                    q.QuestionType == QuestionType.Radio)
                    .WithMessage("La liste d'options est requise pour les types 'check', 'combo' ou 'radio'.")
            .Null()
            .When(q => q.QuestionType == QuestionType.Short ||
                    q.QuestionType == QuestionType.Long ||
                    q.QuestionType == QuestionType.Date ||
                    q.QuestionType == QuestionType.Email ||
                    q.QuestionType == QuestionType.Integer)
                    .WithMessage("La liste d'options est requise pour les types 'Short', 'Long' ou 'Date', 'Email', 'Integer'.");
        
    }

    //need pour la requête POST (A VERIFIER)
    public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(Question question) {
        return await this.ValidateAsync(question, q => q.IncludeRuleSets("default", "create"));
    }

    
    public async Task<bool> BeUniqueIdxForForm(Question question, int idx, CancellationToken cancellationToken) {
        return !await _context.Questions
                .AnyAsync(q => q.FormId == question.FormId && q.Idx == idx && q.Id != question.Id, cancellationToken);
    }

    public async Task<bool> BeUniqueTitleForForm(Question question, string title, CancellationToken cancellationToken) {
        return !await _context.Questions
            .AnyAsync(q => q.Title == title && q.FormId == question.FormId && q.Id != question.Id, cancellationToken);
    }
    
}

/* 
- idx doit être supérieur à 0.
- Le couple form, idx doit être unique, autrement dit deux questions d'un même formulaire ne peuvent pas avoir le même indice.
- title doit avoir au minimum une longueur de 3 caractères.
- Le couple form, title doit être unique, autrement dit deux questions d'un même formulaire ne peuvent pas avoir le même titre.
- description, si elle est remplie, doit avoir au minimum une longueur de 3 caractères.
- required doit prendre la valeur 0 (faux) ou 1 (vrai).
- option_list doit référencer une liste d'options si type vaut 'check', 'combo' ou 'radio', sinon doit être null. 
*/