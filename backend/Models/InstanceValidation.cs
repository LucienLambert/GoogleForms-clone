using FluentValidation;
using Microsoft.EntityFrameworkCore;

using prid_2425_a01.Models;
namespace prid_2425_a01.Models;

public class InstanceValidation : AbstractValidator<Instance>
{

    private readonly FormContext _context;

    public InstanceValidation(FormContext context) {

        _context = context;
        // completed, si elle est remplie, doit être postérieure à started et inférieure ou égale à la date/heure courante.
        RuleSet("Create", () => {
            RuleFor(i => i.Completed)
                .GreaterThan(i => i.Started)
                .WithMessage("The completion date must be posterior to the starting date.")
                .LessThanOrEqualTo(DateTime.Now)
                .WithMessage("The completion date must be less than or equal to the current date.");
        });
    }
    public async Task<FluentValidation.Results.ValidationResult> ValidateOnCreate(Instance instance) {
        return await this.ValidateAsync(instance, vs => vs.IncludeRuleSets("default", "Create"));
    }

    public async Task<FluentValidation.Results.ValidationResult> ValidateOnUpdate(Instance instance) {
        return await this.ValidateAsync(instance, vs => vs.IncludeRuleSets("default", "Create"));
    }
}
