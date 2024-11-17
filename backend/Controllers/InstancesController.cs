using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using prid_2425_a01.Helpers;
using prid_2425_a01.Models;

namespace prid_2425_a01.Controllers;

// [Authorize]
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

}
