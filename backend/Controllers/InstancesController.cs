using AutoMapper;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.IdentityModel.Tokens;
using prid_2425_a01.Helpers;
using System.Security.Claims;
using prid_2425_a01.Models;
using System.ComponentModel.DataAnnotations;

namespace prid_2425_a01.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class InstancesController : ControllerBase
{

    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public InstancesController(ApplicationDbContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InstanceDTO>>> GetAll() {
        var instances = await _context.Instances.ToListAsync();
        var instanceDTOs = _mapper.Map<List<InstanceDTO>>(instances);
        return Ok(instanceDTOs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InstanceDTO>> GetOneById(int id) {
        var instance = await _context.Instances.FindAsync(id);
        if (instance == null)
            return NotFound();
        return _mapper.Map<InstanceDTO>(instance);
    }
    
    // Including Answers, Form, Form-Questions, Question-optionlist etc.
    [Authorized(Role.Admin, Role.User)]
    [HttpGet("{instanceId}/full")]
    public async Task<ActionResult<InstanceDTO>> GetOneByIdFull(int instanceId) {
        
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId));
        
        if (user == null) {
            return Unauthorized();
        }
        
        var instance = await _context.Instances
            .Where(i => i.Id == instanceId)
            .Include(i => i.ListAnswers)
            .Include(i => i.Form)
            .ThenInclude(f => f.ListQuestions)
            .ThenInclude(q => q.OptionList)
            .ThenInclude(ol => ol.ListOptionValues)
            .FirstOrDefaultAsync();
        
        if (instance == null)
            return NotFound();
        if (user.Id != instance.UserId && user.Id != instance.Form.OwnerId)
            return Unauthorized();
        
        return Ok(_mapper.Map<Instance_With_Answers_And_Form_With_Questions_CompleteDTO>(instance));
    }
    
    [Authorized(Role.Admin, Role.User)]
    [HttpGet("by_form_or_fresh/{id}")]
    public async Task<ActionResult<IEnumerable<InstanceDTO>>> GetExistingOrFreshInstanceByFormId(int id) {
        // Returns an instance for the formid - logged user combinaison. /!\ If not found, returns a fresh instance
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId));

        var form = await _context.Forms.FirstOrDefaultAsync(f => f.Id == id);

        if (user == null) {
            return Unauthorized();
        }

        if (form == null) {
            return NotFound();
        }

        Instance freshInstance = new() {
            FormId = id,
            UserId = user.Id,
            Started = DateTime.Now,
            Completed = null
        };

        if (user.IsInRole(Role.Guest)) {
            _context.Instances.Add(freshInstance);
            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<Instance_With_AnswersDTO>(freshInstance));
        }

        var instance = await _context.Instances.Where(i => i.FormId == id && i.UserId == user.Id)
            .Include(i=>i.ListAnswers)
            .FirstOrDefaultAsync();


        if (instance == null) {
            _context.Instances.Add(freshInstance);
            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<Instance_With_AnswersDTO>(freshInstance));
        }

        return Ok(_mapper.Map<Instance_With_AnswersDTO>(instance));
    }

    
    // Updates the instance, its answers and doesn't mark it as completed
    [Authorized(Role.Admin, Role.User)]
    [HttpPut("instance/updateAll")]
    public async Task<IActionResult> UpdateAllInstance(Instance_With_AnswersDTO instanceDto) {
            
        //TODO: Better security
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId!));
        if (currentUser == null) {
            return Unauthorized();
        }

        var instance = await _context.Instances
            .Where(i => i.Id == instanceDto.Id)
            .Include(i => i.ListAnswers)
            .FirstOrDefaultAsync();
            
        if (instance == null)
            return NotFound();
        
        if (currentUser.Id != instance.UserId)
            return Unauthorized();
            
        var validator = new InstanceValidation(_context);
        var result = await validator.ValidateOnUpdate(instance);

        if (!result.IsValid)
            return BadRequest(result);
            
        _context.RemoveRange(instance.ListAnswers);
            
        foreach (AnswerDTO instanceDtoListAnswer in instanceDto.ListAnswers)
        {
            instance.ListAnswers.Add(_mapper.Map<Answer>(instanceDtoListAnswer));
        }
            
        _context.Instances.Update(instance);
        await _context.SaveChangesAsync();
            
        return Ok(_mapper.Map<Instance_With_AnswersDTO>(instance));
    }
    
    

    // Updates the instance, its answers and marks it as completed
    [Authorized(Role.Admin, Role.User)]
    [HttpPut("instance/completed")]
    public async Task<IActionResult> CompleteInstance(Instance_With_AnswersDTO instanceDto) {
        
        //TODO: Better security
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId!));
        if (currentUser == null) {
            return Unauthorized();
        }

        var instance = await _context.Instances
            .Where(i => i.Id == instanceDto.Id)
            .Include(i => i.ListAnswers)
            .FirstOrDefaultAsync();
        
        if (instance == null)
            return NotFound();
        
        if (currentUser.Id != instance.UserId)
            return Unauthorized();
        
        instance.Completed = DateTime.Now;
        
        var validator = new InstanceValidation(_context);
        var result = await validator.ValidateOnUpdate(instance);

        if (!result.IsValid)
            return BadRequest(result);
        
        _context.RemoveRange(instance.ListAnswers);
        
        foreach (AnswerDTO instanceDtoListAnswer in instanceDto.ListAnswers)
        {
            instance.ListAnswers.Add(_mapper.Map<Answer>(instanceDtoListAnswer));
        }
        
        _context.Instances.Update(instance);
        await _context.SaveChangesAsync();
        
        return Ok(_mapper.Map<Instance_With_AnswersDTO>(instance));
    }



    // update the instance - answers for a single question
    [Authorized(Role.Admin, Role.User)]
    [HttpPut("update/answers")]
    public async Task<IActionResult> UpdateAnswers(Instance_With_AnswersDTO instanceDto) {
        
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId!));
        if (currentUser == null) {
            return Unauthorized();
        }

        var newAnswersDto = instanceDto.ListAnswers;
        QuestionType questionType;
        int questionId;
        
        if (newAnswersDto.Count > 0) {
            questionId = newAnswersDto.First().QuestionId;
            if (newAnswersDto.Any(a => a.QuestionId != questionId)) {
                return BadRequest("Answers of multiple questions provided.");
            }
            questionType = _context.Questions.FirstOrDefault(q => q.Id == questionId)!.QuestionType;
            
        } else {
            return BadRequest("Empty list of answers provided.");
        }
        
        var instance = await _context.Instances.Where(i=>i.Id == instanceDto.Id)
            .Include(i=>i.ListAnswers)
            .ThenInclude(a=>a.Question)
            .FirstOrDefaultAsync();

        if (instance != null) {
            instance.ListAnswers = instance.ListAnswers.Where(a=>a.QuestionId != questionId).ToList();
            ICollection<Answer> questionAnswers = new List<Answer>(); 
        
            if (currentUser.Id != instance.UserId)
                return Unauthorized();
            
            if (questionType == QuestionType.Check) {
                foreach (AnswerDTO answerDto in newAnswersDto) {
                    questionAnswers.Add(_mapper.Map<Answer>(answerDto));    
                }
                //Index update
                var count = 1;
                questionAnswers = questionAnswers.OrderBy(a => int.Parse(a.Value)).ToList();
                foreach (Answer questionAnswer in questionAnswers) {
                    questionAnswer.Idx = count;
                    ++count;
                }
            } else {
                questionAnswers.Add(_mapper.Map<Answer>(newAnswersDto.First()));
            }
            
            //validation
            var validator = new AnswerValidation(_context);
            var answersCount = 0;
            foreach (Answer questionAnswer in questionAnswers)
            {
                var result = await validator.ValidateOnUpdate(questionAnswer, answersCount);
                if (!result.IsValid)
                    return BadRequest(result);
                ++answersCount;
            }
            
            foreach (Answer instanceQuestionAnswer in questionAnswers)
            {
                instance.ListAnswers.Add(instanceQuestionAnswer);
            }
            
            instance.ListAnswers = instance.ListAnswers.OrderBy(a=>a.QuestionId).ToList();
            _context.Instances.Update(instance);
            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<Instance_With_AnswersDTO>(instance));
        } else {
            return BadRequest("Incorrect datas.");    
        }
    }
    
    //delete answers for one question
    [Authorized(Role.Admin, Role.User)]
    [HttpDelete("{instanceId:int}/question/{questionId:int}")]
    public async Task<ActionResult<bool>> DelQuestionFormById(int instanceId, int questionId) {
        
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId!));
        if (currentUser == null) {
            return Unauthorized();
        }
        
        var instance = _context.Instances
            .Include(i => i.ListAnswers)
            .FirstOrDefault(i => i.Id == instanceId);
        if (instance == null) {
            return NotFound();
        }
        if (currentUser.Id != instance.UserId)
            return Unauthorized();
        
        instance.ListAnswers = instance.ListAnswers.Where(a => a.QuestionId != questionId).ToList();
        _context.Instances.Update(instance);
        await _context.SaveChangesAsync();

        return Ok(true);
    }

    [HttpDelete("{instanceId:int}")]
    [Authorized(Role.Admin, Role.User)]
    public async Task<ActionResult<bool>> DeleteInstanceById(int instanceId) {
        
        //TODO: Better security
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId!));
        
        var instanceToDelete = await _context.Instances.FirstOrDefaultAsync(i => i.Id == instanceId);
        if (instanceToDelete == null) {
            return NotFound();
        }
        
        if (currentUser == null || instanceToDelete.UserId != int.Parse(userId)) {
            return Unauthorized();
        }

        _context.Instances.Remove(instanceToDelete);
        await _context.SaveChangesAsync();

        return Ok(true);
    }

    // deletes if not guest and returns a new instance 
    [Authorized(Role.Admin, Role.User)]
    [HttpPost("refresh/by_form_id/{formId:int}")]
    public async Task<ActionResult> CreateByFormId(int formId) {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId!));
        var form = await _context.Forms.FirstOrDefaultAsync(f => f.Id == formId);
        if (currentUser == null) {
            return Unauthorized();
        }
        if (form == null) {
            return BadRequest();
        }
        var canAccess = _context.UserFormAccesses.Any(ufc => ufc.FormId == form.Id && ufc.UserId == currentUser.Id);
        if (!canAccess && !form.IsPublic && form.OwnerId != int.Parse(userId)) {
            return Unauthorized();
        }
        
        Instance freshInstance = new() {
            FormId = form.Id,
            UserId = currentUser.Id,
            Started = DateTime.Now,
            Completed = null
        };
        
        if (!currentUser.IsInRole(Role.Guest)) {
            var instanceToDelete = await _context.Instances.FirstOrDefaultAsync(i => i.FormId == formId && i.UserId == currentUser.Id);
            if (instanceToDelete != null){
                _context.Instances.Remove(instanceToDelete);
                await _context.SaveChangesAsync();
            }
            
        }
        
        var savedInstance = await _context.Instances.AddAsync(freshInstance);
        await _context.SaveChangesAsync();
        
        return Ok(_mapper.Map<InstanceDTO>(savedInstance.Entity));
    }
    
    [Authorized(Role.Admin, Role.User)]
    [HttpDelete("delMultiInstanceById")]
    public async Task<ActionResult<bool>> DelMultiInstanceById([FromQuery] List<int> instanceIds){
        
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId!));
        
        if (currentUser == null)
            return Unauthorized();
        
        if(instanceIds == null || !instanceIds.Any()){
            return NotFound("first not found");
        }

        var instancesToRemove = await _context.Instances
            .Include(i=>i.Form)
            .Where(i => instanceIds.Contains(i.Id)).ToListAsync();
        
        // If editors are allowed
        var editorIds = _context.UserFormAccesses.Where(uf => uf.FormId == instancesToRemove[0].FormId && uf.AccessType == AccessType.Editor)
                                                        .Select(ufa=>ufa.UserId)
                                                        .ToList();
        
        if (currentUser.Id != instancesToRemove[0].Form.OwnerId || editorIds.Contains(currentUser.Id))
            return Unauthorized();

        
        if(!instancesToRemove.Any()){
            return NotFound("second not found");
        }

        _context.Instances.RemoveRange(instancesToRemove);
        await _context.SaveChangesAsync();

        return Ok(true);
    }

    [Authorized(Role.Admin, Role.User)]
    [HttpDelete("delInstancesCompletedByFormId/{formId:int}")]
    public async Task<ActionResult<bool>> DelInstancesCompletedByFormId(int formId){
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
            return Unauthorized("User not found");
        }

        var currentUser = await _context.Users.Where(u => u.Id == userIdInt).FirstOrDefaultAsync();

        var form = await _context.Forms.Where(f => f.Id == formId).FirstOrDefaultAsync();

        if(!(currentUser?.Role == Role.Admin || form.OwnerId == userIdInt || _context.UserFormAccesses
        .Any(ufa => ufa.UserId == userIdInt && ufa.FormId == form.Id && ufa.AccessType == AccessType.Editor))){
            return Unauthorized();
        }

        var instancesToRemove = await _context.Instances
            .Where(i => i.FormId == formId && i.Completed != null).ToListAsync();

        if(instancesToRemove == null){
            return NotFound(false);
        }

        _context.Instances.RemoveRange(instancesToRemove);
        await _context.SaveChangesAsync();

        return Ok(true);
    }
}
