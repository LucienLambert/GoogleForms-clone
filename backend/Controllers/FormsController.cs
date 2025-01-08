using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using prid_2425_a01.Helpers;

using prid_2425_a01.Models;
using prid_2425_a01.Models.form;
using System.Security.Claims;
namespace prid_2425_a01.Controllers;


[Authorize]
[Route("api/[controller]")]
[ApiController]
public class FormsController : ControllerBase {
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    
    public FormsController(ApplicationDbContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }

    // [Authorized(Role.Admin)]
    // [HttpGet]
    // //récupère la liste des formulaires
    // public async Task<ActionResult<IEnumerable<FormDTO>>> GetAll() {
    //     var allForms = await _context.Forms
    //         .Include(f => f.Owner)
    //         .Include(f => f.ListInstances)
    //         .OrderBy(f => f.Title)
    //         .ToListAsync();

    //     var formsDTO = allForms.Select(f => {
    //         var lastInstance = f.ListInstances.OrderByDescending(i => i.Id).FirstOrDefault();
    //         var formDTO = _mapper.Map<Form_with_LastInstanceDTO>(f);

    //         if (lastInstance != null)
    //         {
    //             formDTO.LastInstance = new Instance_only_DateDTO
    //             {
    //                 Started = lastInstance.Started,
    //                 Completed = lastInstance.Completed
    //             };
    //         }

    //         return formDTO;
    //     }).ToList();

    //     return Ok(formsDTO);
    // }

    [HttpGet("{title}")]
    public async Task<ActionResult<FormDTO>> GetOneByTitle(string title) {
        var form = await _context.Forms.FirstOrDefaultAsync(f => f.Title == title);
        if(form == null) {
            return NotFound();
        }
        return _mapper.Map<FormDTO>(form);
    }
    
    [HttpGet("id/{id:int}")]
    public async Task<ActionResult<FormDTO>> GetOneById(int id){
        var form = await _context.Forms
        .Include(f => f.Owner)
        .FirstOrDefaultAsync(f => f.Id == id);
        
        if(form == null) {
            return NotFound();
        }
        return _mapper.Map<FormDTO>(form);
    }
    
    [HttpGet("{id:int}/questions")]
    public async Task<ActionResult<Form_With_QuestionsDTO>> GetOneByIdWithQuestions(int id){
        var form = await _context.Forms
            .Include(f=>f.ListQuestions)
            .ThenInclude(q=>q.OptionList)
            .ThenInclude(ol=>ol.ListOptionValues)
            .FirstOrDefaultAsync(f => f.Id == id);
        if(form == null) {
            return NotFound();
        }
        return Ok(_mapper.Map<Form_With_QuestionsDTO>(form));
    }

    [Authorize]
    [HttpDelete("{id:int}/form")]
    public async Task<ActionResult<bool>> DeleteForm(int id){
        var form = await _context.Forms.FirstOrDefaultAsync(f => f.Id == id);
        if(form == null) {
            return NotFound(false);
        }
        _context.Forms.Remove(form);
        await _context.SaveChangesAsync();
        return Ok(true);
    }

    //TO FIX : fonctionne mais la modification du form est trop complexe et donc illisible
    [HttpPut]
    public async Task<IActionResult> PutForm(FormDTO dto) {
        var form = await _context.Forms.FindAsync(dto.Id);

        if (form == null)
            return NotFound();

        _mapper.Map(dto, form);

        var result = await new FormValidation(_context).ValidateAsync(form);

        if (!result.IsValid)
            return BadRequest(result);

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // [Authorize]
    // [HttpGet("User/forms")]
    // public async Task<ActionResult<IEnumerable<FormDTO>>> GetUserForms(){
    //     // Récupérer l'ID de l'utilisateur connecté
    //     var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    //     if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
    //         return Unauthorized("User ID est manquant dans le token.");
    //     }
        
    //     // Charger directement les formulaires de l'utilisateur connecté avec leur propriétaire
    //     var forms = await _context.Forms
    //         .Where(f => f.OwnerId == userIdInt)
    //         .Include(f => f.Owner) // Inclure les données du propriétaire
    //         .OrderBy(f => f.Title) // Trier par titre
    //         .ToListAsync();

    //     // Vérifier si aucun formulaire n'est trouvé
    //     if (forms == null || !forms.Any()){
    //         return NotFound("Aucun formulaire trouvé pour cet utilisateur.");
    //     }

    //     // Mapper directement les formulaires en FormDTO
    //     return Ok(_mapper.Map<List<FormDTO>>(forms));
    // }

    // [Authorize]
    // [HttpGet("Public/forms")]
    // public async Task<ActionResult<IEnumerable<FormDTO>>> GetPublicForm(){
    //     //récup les formulaires qui sont public avec les infos du owner et trie le contenue par ordre aphabétique des titres
    //     var listPublicForm = await _context.Forms.Where(f => f.IsPublic == true)
    //         .Include(f => f.Owner)
    //         .OrderBy(f => f.Title)
    //         .ToListAsync();

    //     //is la liste est null ou vide alors NotFound()
    //     if(listPublicForm == null || !listPublicForm.Any()){
    //         return NotFound("Aucun Formulaire avec le statut Public n'a été trouvé");
    //     }

    //     //return et convertie la listePublicForm en Objet DTO
    //     return Ok(_mapper.Map<List<FormDTO>>(listPublicForm));
    // }

    [Authorize]
    [HttpGet("Owner_Public_Access/forms")]
    public async Task<ActionResult<IEnumerable<FormDTO_With_All_ListDTO>>> GetOwnerPublicAccessForm() {

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
            return Unauthorized("User Unfound");
        }
        var currentUser = await _context.Users.Where(u => u.Id == userIdInt).FirstOrDefaultAsync();

        var allForms = await _context.Forms
            .Where(f =>  
                currentUser!.Role == Role.Admin ||
                f.OwnerId == userIdInt ||
                f.IsPublic || 
                _context.UserFormAccesses.Any(ufa => ufa.UserId == userIdInt && ufa.FormId == f.Id))
            .Include(f => f.ListInstances.Where(i => i.UserId == userIdInt).OrderByDescending(i => i.Id).Take(1))
            .Include(f => f.ListInstances)
            .Include(f => f.Owner)
            .Include(f => f.ListUserFormAccesses.Where(ufa => ufa.UserId == userIdInt))
            .Include(f => f.ListQuestions)
            .OrderBy(f => f.Title.ToLower())
            .ToListAsync();
            
        if (!allForms.Any()) {
            return NotFound("Aucun formulaire trouvé.");
        }

        var formsDTO = _mapper.Map<List<FormDTO_With_All_ListDTO>>(allForms);


        return Ok(formsDTO);
    }
    
    [Authorized(Role.Admin, Role.User)]
    [HttpPost("createForm")]
    public async Task<ActionResult<FormDTO>> CreateForm(FormDTO formDto) {
        var form = _mapper.Map<Form>(formDto);
        var formValidationService = new FormValidation(_context);
        var result = await formValidationService.ValidateOnCreate(form);
        
        if (!result.IsValid)
            return BadRequest(result);
        
        _context.Forms.Add(form);
        await _context.SaveChangesAsync();
        return CreatedAtAction("GetOneById", new { id = form.Id }, _mapper.Map<FormDTO>(form));
    }
    
    [Authorized(Role.Admin, Role.User)]
    [HttpPut("updateForm")]
    public async Task<IActionResult> UpdateForm(FormDTO formDto) {
        var existingForm = await _context.Forms.FirstOrDefaultAsync(f => f.Id == formDto.Id);
        
        if (existingForm == null)
            return NotFound();
        
        _mapper.Map(formDto, existingForm);
        
        var formValidationService = new FormValidation(_context);
        var result = await formValidationService.ValidateOnCreate(existingForm);

        if (!result.IsValid)
            return BadRequest(result);
        
        _context.Forms.Update(existingForm);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Form updated successfully.", form = existingForm });
    }

    [Authorize]
    [HttpGet("{id:int}/manager")]
    public async Task<ActionResult<FormDTO_With_Form_QuestionsDTO>> GetOneFormManager(int id) {
        //vérifier que le currentUser puisse accéder au form_Manager
        //récup le form via l'ID avec title, description, owner, isPublic + liste question associé
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
            return Unauthorized("User Unfound");
        }
        var currentUser = await _context.Users.Where(u => u.Id == userIdInt).FirstOrDefaultAsync();
        
        var form = await _context.Forms
        .Where(f => f.Id == id)
        .Include(f => f.Owner)
        .Include(f => f.ListInstances)
        .Include(f => f.ListQuestions.OrderBy(lq => lq.Idx))
        .ThenInclude(lq => lq.OptionList)
        .FirstOrDefaultAsync();
        
        var canAccess = _context.UserFormAccesses.Where(ufc => ufc.FormId == form.Id && ufc.UserId == currentUser.Id).Any();

        if(!(currentUser.Role == Role.Admin || currentUser.Id == form.OwnerId || canAccess)){
            return Forbid();
        }
        
        return Ok(_mapper.Map<FormDTO_With_Form_QuestionsDTO>(form));
    }

    [Authorize]
    [HttpDelete("{formId:int}/question/{questionId:int}")]
    public async Task<ActionResult<bool>> DelQuestionFormById(int formId, int questionId) {
        //check si user est connecté
        //check si form contient la question
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
            return Unauthorized("User Unfound");
        }
        var currentUser = await _context.Users.Where(u => u.Id == userIdInt).FirstOrDefaultAsync();

        // var form = await _context.Forms
        //     .Where(f => _context.Questions.Any(q => q.Id == questionId && q.FormId == formId) && 
        //             (f.Owner.Id == currentUser!.Id ||
        //             currentUser.Role == Role.Admin ||
        //             _context.UserFormAccesses.Any(ufa => ufa.UserId == userIdInt && 
        //                 ufa.FormId == f.Id &&
        //                 ufa.AccessType == AccessType.Editor)))
        //     .FirstOrDefaultAsync();

        var form = await CanActionOnQuestionForm(formId, questionId);

        if(form == null){
            return NotFound(false);
        }

        var question = await _context.Questions.Where(q => q.Id == questionId).FirstOrDefaultAsync();

        _context.Questions.Remove(question);
        await _context.SaveChangesAsync();

        return Ok(true);
    }
    
    [Authorized(Role.Admin, Role.User)]
    [HttpGet("isTitleUnique")]
    public async Task<ActionResult<bool>> IsTitleUnique(string title, int ownerId, int? formId) {
        var exists = await _context.Forms.AnyAsync(f => 
                f.Title == title && 
                f.OwnerId == ownerId &&
                (formId == null || f.Id != formId)
        );
        return Ok(!exists);
    }

    
    [Authorized(Role.Admin, Role.User)]
    [HttpGet("getFormQuestionsById")]
    public async Task<ActionResult<List<Question_CompleteDTO_With_AnswersDTO>>> GetFormQuestions(int? formId)
    {
        if (formId == null)
        {
            return BadRequest("Form ID cannot be null.");
        }

        var questions = await _context.Questions
            .Where(q => q.FormId == formId)
            .Include(q => q.OptionList)
            .ThenInclude(ol => ol.ListOptionValues)
            .ToListAsync();

        if (!questions.Any())
        {
            return NotFound("No questions or answers found for the provided Form ID.");
        }

        var completedInstances = _context.Instances.Where(i => i.FormId == formId && i.Completed != null)
            .Select(i => i.Id).ToList();
        
        var answers = await _context.Answers.Where(a => questions.Select(q => q.Id)
                .Contains(a.QuestionId) && completedInstances.Contains(a.InstanceId)).ToListAsync();

        var result = questions.Select(question =>
        {
            var questionDto = _mapper.Map<Question_CompleteDTO_With_AnswersDTO>(question);
            questionDto.AnswersList = answers
                .Where(a => a.QuestionId == question.Id)
                .Select(a => _mapper.Map<AnswerDTO>(a))
                .ToList();

            return questionDto;
        }).ToList();

        return Ok(result);
    }


    [Authorize]
    [HttpPost("{formId:int}/moveUpQuestion/{questionId:int}")]
    public async Task<ActionResult<bool>> MoveUpQuestionForm(int formId, int questionId){
        // Vérifie si l'utilisateur a les droits d'action sur la question
        var canAct = await CanActionOnQuestionForm(formId, questionId);
        
        if (canAct == null) {
            return NotFound("pas droit d'acces au form");
        }

        var question = await _context.Questions.Where(q => q.Id == questionId).FirstOrDefaultAsync();
        
        if (question == null) {
            return NotFound("no question found");
        }

        // Récupère la question située juste au-dessus
        var questionTemp = await _context.Questions
            .Where(q => q.FormId == formId && q.Idx < question.Idx)
            .OrderByDescending(q => q.Idx)
            .FirstOrDefaultAsync();

        if (questionTemp == null) {
            return NotFound("no question above found");
        }

        // Échange les indices
        var tempIdx = question.Idx;
        question.Idx = questionTemp.Idx;
        questionTemp.Idx = tempIdx;

        // Sauvegarde les modifications dans la base de données
        await _context.SaveChangesAsync();

        return Ok(true);
    }

    [Authorize]
    [HttpPost("{formId:int}/moveDownQuestion/{questionId:int}")]
    public async Task<ActionResult<bool>> MoveDownQuestionForm(int formId, int questionId){
        // Vérifie si l'utilisateur a les droits d'action sur la question
        var canAct = await CanActionOnQuestionForm(formId, questionId);
        
        if (canAct == null) {
            return NotFound("pas droit d'acces au form");
        }

        var question = await _context.Questions.Where(q => q.Id == questionId).FirstOrDefaultAsync();
        
        if (question == null) {
            return NotFound("no question found");
        }

        // Récupère la question située juste au-dessus
        var questionTemp = await _context.Questions
            .Where(q => q.FormId == formId && q.Idx > question.Idx)
            .OrderBy(q => q.Idx)
            .FirstOrDefaultAsync();

        if (questionTemp == null) {
            return NotFound("no question above found");
        }

        // Échange les indices
        var tempIdx = question.Idx;
        question.Idx = questionTemp.Idx;
        questionTemp.Idx = tempIdx;

        // Sauvegarde les modifications dans la base de données
        await _context.SaveChangesAsync();

        return Ok(true);
    }

    private async Task<ActionResult<bool>> CanActionOnQuestionForm(int formId, int questionId){
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
            return Unauthorized("User Unfound");
        }

        var currentUser = await _context.Users.Where(u => u.Id == userIdInt).FirstOrDefaultAsync();

        var form = await _context.Forms
            .Where(f => _context.Questions.Any(q => q.Id == questionId && q.FormId == formId) && 
                    (f.Owner.Id == currentUser!.Id ||
                    currentUser.Role == Role.Admin ||
                    _context.UserFormAccesses.Any(ufa => ufa.UserId == userIdInt && 
                        ufa.FormId == f.Id &&
                        ufa.AccessType == AccessType.Editor)))
            .FirstOrDefaultAsync();
        if (form == null){
            return Forbid("User does not have permission to perform this action.");
        }

        return Ok(true);
    }

    [Authorize]
    [HttpPost("{formId:int}/isPublicFormChange")]
    public async Task<ActionResult<bool>> IsPublicFormChange(int formId){
        //form exits
        //access to Form
        //check IsPublic or Not

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
            return Unauthorized("User not found");
        }

        var currentUser = await _context.Users.Where(u => u.Id == userIdInt).FirstOrDefaultAsync();

        //récupère le form + la liste des UserFormAccess correspondant
        var form = await _context.Forms
            .Include(f => f.ListUserFormAccesses)
            .FirstOrDefaultAsync(f => f.Id == formId);

        if(form == null){
            return NotFound(false);
        }
        
        if(currentUser?.Role == Role.Admin || form.OwnerId == userIdInt || _context.UserFormAccesses
        .Any(ufa => ufa.UserId == userIdInt && ufa.FormId == form.Id && ufa.AccessType == AccessType.Editor)){
            //si form == false, ça veut dire que l'on doit passer le form en public ou inversément.
            if(form.IsPublic == false) {
                var userAccess = _context.UserFormAccesses.Where(ufa => ufa.AccessType == AccessType.User && ufa.FormId == formId).ToList();
                if(userAccess.Any()){
                    _context.UserFormAccesses.RemoveRange(userAccess);
                }
            }
            form.IsPublic = !form.IsPublic;
        }
        await _context.SaveChangesAsync();

        return Ok(form.IsPublic);
    }


}