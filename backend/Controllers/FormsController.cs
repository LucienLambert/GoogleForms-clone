using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using prid_2425_a01.Helpers;

using prid_2425_a01.Models;
using System.Security.Claims;
namespace prid_2425_a01.Controllers;

//
// [Authorize]
[Route("api/[controller]")]
[ApiController]
public class FormsController : ControllerBase {
    private readonly FormContext _context;
    private readonly IMapper _mapper;
    
    public FormsController(FormContext context, IMapper mapper) {
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
        var form = await _context.Forms.FirstOrDefaultAsync(f => f.Id == id);
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


    [HttpDelete("{id}")]
    public async Task<ActionResult<FormDTO>> DeleteForm(int id){
        var form = await _context.Forms.FirstOrDefaultAsync(f => f.Id == id);
        if(form == null) {
            return NotFound();
        }
        _context.Forms.Remove(form);
        await _context.SaveChangesAsync();
        return _mapper.Map<FormDTO>(form);
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

    [Authorize]
    [HttpGet("User/forms")]
    public async Task<ActionResult<IEnumerable<FormDTO>>> GetUserForms(){
        // Récupérer l'ID de l'utilisateur connecté
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
            return Unauthorized("User ID est manquant dans le token.");
        }
        
        // Charger directement les formulaires de l'utilisateur connecté avec leur propriétaire
        var forms = await _context.Forms
            .Where(f => f.OwnerId == userIdInt)
            .Include(f => f.Owner) // Inclure les données du propriétaire
            .OrderBy(f => f.Title) // Trier par titre
            .ToListAsync();

        // Vérifier si aucun formulaire n'est trouvé
        if (forms == null || !forms.Any()){
            return NotFound("Aucun formulaire trouvé pour cet utilisateur.");
        }

        // Mapper directement les formulaires en FormDTO
        return Ok(_mapper.Map<List<FormDTO>>(forms));
    }

    [Authorize]
    [HttpGet("Public/forms")]
    public async Task<ActionResult<IEnumerable<FormDTO>>> GetPublicForm(){
        //récup les formulaires qui sont public avec les infos du owner et trie le contenue par ordre aphabétique des titres
        var listPublicForm = await _context.Forms.Where(f => f.IsPublic == true)
            .Include(f => f.Owner)
            .OrderBy(f => f.Title)
            .ToListAsync();

        //is la liste est null ou vide alors NotFound()
        if(listPublicForm == null || !listPublicForm.Any()){
            return NotFound("Aucun Formulaire avec le statut Public n'a été trouvé");
        }

        //return et convertie la listePublicForm en Objet DTO
        return Ok(_mapper.Map<List<FormDTO>>(listPublicForm));
    }

    [Authorize]
    [HttpGet("Owner_Public_Access/forms")]
    public async Task<ActionResult<IEnumerable<Form_with_LastInstanceDTO>>> GetOwnerPublicAccessForm(){
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
            return Unauthorized("User Unfound");
        }
        var currentUser = await _context.Users.Where(u => u.Id == userIdInt).FirstOrDefaultAsync();

        var allForms = await _context.Forms
        .Include(f => f.ListInstances.Where(i => i.UserId == userIdInt).OrderByDescending(i => i.Id).Take(1))
            .Where(f =>  currentUser!.Role == Role.Admin || f.OwnerId == userIdInt || f.IsPublic || 
            _context.UserFormAccesses.Any(ufa => ufa.FormId == userIdInt && ufa.FormId == f.Id))
            .Include(f => f.Owner)
            .Include(f => f.ListInstances)
            .OrderBy(f => f.Title)
            .ToListAsync();
            
        if (!allForms.Any()) {
            return NotFound("Aucun formulaire trouvé.");
        }

        var formsDTO = _mapper.Map<List<Form_with_LastInstanceDTO>>(allForms);

        return Ok(formsDTO);
    }

}