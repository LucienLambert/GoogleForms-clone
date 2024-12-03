using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using prid_2425_a01.Helpers;
using System.Security.Claims;
using prid_2425_a01.Models;

namespace prid_2425_a01.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class InstancesController : ControllerBase {

    private readonly FormContext _context;
    private readonly IMapper _mapper;
    
    public InstancesController(FormContext context, IMapper mapper) {
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
            return Ok(_mapper.Map<InstanceDTO>(freshInstance));
        }
        
        var instance = await _context.Instances.Where(i => i.FormId == id && i.UserId == user.Id)
                .FirstOrDefaultAsync();

        if (instance == null) {
            _context.Instances.Add(freshInstance);
            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<InstanceDTO>(freshInstance));
        }
        
        return Ok(_mapper.Map<InstanceDTO>(instance));
}
    
}
