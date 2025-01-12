using FluentValidation;

namespace prid_2425_a01.Models.OptionValue
{
    public class OptionValueValidation : AbstractValidator<OptionValue> {

        public OptionValueValidation() {
            
            RuleFor(ov => ov.Value)
                .NotEmpty().WithMessage("Value cannot be empty")
                .MinimumLength(3).WithMessage("Name must be at least 3 characters long");
        }
        
        public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(Models.OptionValue.OptionValue optionValue) {
            return await this.ValidateAsync(optionValue, o => o.IncludeRuleSets("default", "create"));
        }
        
        public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(IEnumerable<Models.OptionValue.OptionValue> optionValues) 
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