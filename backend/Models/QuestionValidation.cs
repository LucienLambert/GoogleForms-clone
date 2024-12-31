using FluentValidation;
using Microsoft.EntityFrameworkCore;

using prid_2425_a01.Models;
namespace prid_2425_a01.Models;

public class QuestionValidation : AbstractValidator<Question> {

    private readonly ApplicationDbContext _context;


/* idx doit être supérieur à 0.
Le couple form, idx doit être unique, autrement dit deux questions d'un même formulaire ne peuvent pas avoir le même indice.
title doit avoir au minimum une longueur de 3 caractères.
Le couple form, title doit être unique, autrement dit deux questions d'un même formulaire ne peuvent pas avoir le même titre.
description, si elle est remplie, doit avoir au minimum une longueur de 3 caractères.
required doit prendre la valeur 0 (faux) ou 1 (vrai).
option_list doit référencer une liste d'options si type vaut 'check', 'combo' ou 'radio', sinon doit être null. */

    public QuestionValidation(ApplicationDbContext context) {
        
        _context = context;

    }


    
}