using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace prid_2425_a01.Models
{
    public class OptionListValidation : AbstractValidator<OptionList> {
        private readonly ApplicationDbContext _context;

        public OptionListValidation(ApplicationDbContext context) {
            _context = context;
            
            RuleFor(ol => ol.Name)
                .NotEmpty().WithMessage("Name cannot be empty")
                .MinimumLength(3).WithMessage("Name must be at least 3 characters long")
                .MustAsync(BeUniqueNameForOwner).WithMessage("Name must be unique for this user");
        }
        
        public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(OptionList optionList) {
            return await this.ValidateAsync(optionList, o => o.IncludeRuleSets("default", "create"));
        }

        private async Task<bool> BeUniqueNameForOwner(OptionList optionList, string name, CancellationToken cancellationToken) {
            return !await _context.OptionLists
                .AnyAsync(op => op.Name == name && op.OwnerId == optionList.OwnerId && op.Id != optionList.Id, cancellationToken);
        }
    }
}