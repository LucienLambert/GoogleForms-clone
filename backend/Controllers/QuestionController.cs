using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using prid_2425_a01.Helpers;
using prid_2425_a01.Models;


namespace prid_2425_a01.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class QuestionController : ControllerBase {
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public QuestionController (ApplicationDbContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet("id/{id:int}")]
    public async Task<ActionResult<QuestionDTO>> GetOneById(int id) {
        var question = await _context.Questions.FirstOrDefaultAsync(q => q.Id == id);
        if(question == null) {
            return NotFound();
        }
        return _mapper.Map<QuestionDTO>(question);
    }
    
    [Authorized(Role.Admin, Role.User)]
    [HttpGet("isTitleUnique")]
    public async Task<ActionResult<bool>> IsUniqueTitle(string title, int formId, int questionId) {
        var exist = await _context.Questions
                    .AnyAsync(q => q.Title == title &&
                             q.Id != questionId &&
                             q.FormId == formId);
        return Ok(!exist);
    }

    //si pas de question idx = 1
    [Authorized(Role.Admin, Role.User)]
    [HttpPost("createQuestion")]
    public async Task<ActionResult<QuestionDTO>> CreateQuestion(QuestionDTO questionDTO){
        //convertie le DTO en Question
        var question = _mapper.Map<Question>(questionDTO);
        //check s'il existe des question dans le form, si oui on passe idx de la question a idx + 1 sinon idx = 1  
        if(await _context.Questions.AnyAsync(q => q.FormId == question.FormId)) {
            var idxMax = await _context.Questions
                    .Where(q => q.FormId == question.FormId)
                    .MaxAsync(q => q.Idx);
            question.Idx = idxMax+1;
        } else {
            question.Idx = 1;
        }
        //check si la question respect les différentes RuleFor
        var questionValidation = new QuestionValidation(_context);
        //check si la question peut être ajouter
        var result = await questionValidation.ValidateOnCreate(question);
        //si respect pas les RuleFor return l'erreur.
        if(!result.IsValid){
            return BadRequest(result);
        }
        //ajout la question dans la DB puis sauvegarde les changements
        _context.Questions.Add(question);
        await _context.SaveChangesAsync();
        //permet de débugage en passant au front l'option de la requête GetOneById
        return CreatedAtAction("GetOneById", new { id = question.Id }, _mapper.Map<QuestionDTO>(question));
    }

    [Authorized(Role.Admin, Role.User)]
    [HttpPut("updateQuestion")]
    public async Task<IActionResult> UpdateQuestion(QuestionDTO questionDTO){

        var existingQuestion = await _context.Questions.FirstOrDefaultAsync(q => q.Id == questionDTO.Id);
        
        if (existingQuestion == null)
            return NotFound();
        
        _mapper.Map(questionDTO, existingQuestion);
        
        var quesitonValidationService = new QuestionValidation(_context);
        var result = await quesitonValidationService.ValidateOnCreate(existingQuestion);

        if (!result.IsValid)
            return BadRequest(result);
        
        _context.Questions.Update(existingQuestion);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Question updated successfully.", question = existingQuestion });

        // var question = _mapper.Map<Question>(questionDTO);
        // Console.WriteLine(question);

        // if(question == null){
        //     return NotFound();
        // }

        // var questionValidation = new QuestionValidation(_context);

        // var result = await questionValidation.ValidateAsync(question);

        // if(!result.IsValid){
        //     return BadRequest(result);
        // }

        // await _context.SaveChangesAsync();
        // return NoContent();
    }
}