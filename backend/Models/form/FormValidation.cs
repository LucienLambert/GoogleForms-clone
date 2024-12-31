using FluentValidation;
using Microsoft.EntityFrameworkCore;

using prid_2425_a01.Models;
namespace prid_2425_a01.Models;

public class FormValidation : AbstractValidator<Form> {

    private readonly ApplicationDbContext _context;

    public FormValidation(ApplicationDbContext context) {
        //Rélge métier pour la gestion des formulaires. (Rule)
        _context = context;

        RuleFor(f => f.Title)
            .NotEmpty().WithMessage("Un titre est requis")
            .MinimumLength(3).WithMessage("Le titre doit faire min 3 caractères")
            .MustAsync(BeUniqueTitleForOwner).WithMessage("il existe déjà un form portant se titre pour cet user");

        RuleFor(f => f.Description)
            .MinimumLength(3).When(form => form.Description != null)
            .WithMessage("la description doit faire 3 caractères min ou être vide");
    }

    //need pour la requête POST (TODO POST)
    public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(Form form) {
        return await this.ValidateAsync(form, f => f.IncludeRuleSets("default", "create"));
    }

    // Méthode pour vérifier l'unicité du titre pour un même propriétaire
    public async Task<bool> BeUniqueTitleForOwner(Form form, string title, CancellationToken cancellationToken) {
        return !await _context.Forms
            //on vérifie si un form portant le titre appartenant au user dont l'id du form est différent.
            //en gros si un form déjà existant pour le même titre que le form qu'on crée.
            .AnyAsync(f => f.Title == title && f.OwnerId == form.OwnerId && f.Id != form.Id, cancellationToken);
    }
}