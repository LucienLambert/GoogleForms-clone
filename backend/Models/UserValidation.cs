using FluentValidation;
using Microsoft.EntityFrameworkCore;

using prid_2425_a01.Models;

namespace prid_2425_a01.Models;

public class UserValidator : AbstractValidator<User>
{
    private readonly FormContext _context;

    public UserValidator(FormContext context) {
        _context = context;

        //TODO A check pour voir si elle correspond au validation métier de l'itération 1.
        RuleFor(u => u.Email)
            .NotEmpty()
                .WithMessage("Email is required.")
            .EmailAddress()
                .WithMessage("Invalid Email format.")
            .MustAsync(BeUniqueEmail)
                .WithMessage("Email must be unique.");


        RuleFor(u => u.Password)
            .NotEmpty()
                .WithMessage("Password is required")
            .Length(3, 10)
                .WithMessage("The password must be between 3 and 10 characters.");


        RuleFor(u => u.FirstName)
            .NotEmpty()
            .When(u => !string.IsNullOrEmpty(u.LastName))

            .Length(3, 50)
                .WithMessage("The first name length must be between 3 and 50 characters.")
            .Matches(@"^\S.*\S$|^\S$")
                .WithMessage("First name cannot start or end with a space or tabulation.");
        

        RuleFor(u => u.LastName)
            .NotEmpty()
            .When(u => !string.IsNullOrEmpty(u.FirstName))

            .Length(3, 50)
                .WithMessage("The last name length must be between 3 and 50 characters.")
            .Matches(@"^\S.*\S$|^\S$")
                .WithMessage("Last name cannot start or end with a space or tabulation.");


        RuleFor(u => new { u.FirstName, u.LastName })
            .MustAsync((u, token) => BeUniqueNames(u.FirstName, u.LastName, token))
            .WithMessage("First name and last name combinaison must be unique.");


        RuleFor(u => u.BirthDate)
            .LessThan(DateTime.Today)
                .WithMessage("The birth date must be anterior to today.")
            .DependentRules(() => {
                RuleFor(u => u.Age)
                    .InclusiveBetween(18, 125);
            })
                .WithMessage("The age must be included between 18 and 125.");

    }

    private async Task<bool> BeUniqueEmail(string email, CancellationToken token) {
        return !await _context.Users.AnyAsync(u => u.Email == email, token);
    }

    private async Task<bool> BeUniqueNames(string? firstName, string? lastName, CancellationToken token) {
		return string.IsNullOrEmpty(firstName) || 
            string.IsNullOrEmpty(lastName) || 
            !await _context.Users.AnyAsync(u => u.FirstName == firstName && u.LastName == lastName, token);
    }

}