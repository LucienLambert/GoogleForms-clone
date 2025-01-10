using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace prid_2425_a01.Models
{
    public class OptionValueValidation : AbstractValidator<OptionValue> {
        private readonly ApplicationDbContext _context;

        public OptionValueValidation(ApplicationDbContext context) {
            _context = context;
            
            RuleFor(ov => ov.Value)
                .NotEmpty().WithMessage("Value cannot be empty")
                .MinimumLength(3).WithMessage("Name must be at least 3 characters long")
                .MustAsync(BeUniqueNameForOptionList).WithMessage("Value must be unique for this list");
        }
        
        public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(OptionValue optionValue) {
            return await this.ValidateAsync(optionValue, o => o.IncludeRuleSets("default", "create"));
        }

        private async Task<bool> BeUniqueNameForOptionList(OptionValue optionValue, string value, CancellationToken cancellationToken) {
            return !await _context.OptionValues
                .AnyAsync(ov => ov.Value == value && ov.OptionListId == optionValue.OptionListId && ov.Idx != optionValue.Idx, cancellationToken);
        }
        
        public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(IEnumerable<OptionValue> optionValues) 
        {
            var aggregatedResult = new FluentValidation.Results.ValidationResult();

            foreach (var optionValue in optionValues) 
            {
                var result = await ValidateOnCreate(optionValue);
                
                if (!result.IsValid) {
                    aggregatedResult.Errors.AddRange(result.Errors);
                }
            }

            return aggregatedResult;
        }
    }
}