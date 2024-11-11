using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using prid_2425_a01.Helpers;

using prid_2425_a01.Models;
namespace prid_2425_a01.Controllers;


//[Authorize]
[Route("api/[controller]")]
[ApiController]
public class FormsController : ControllerBase {
    private readonly FormContext _context;
    private readonly IMapper _mapper;
    
    public FormsController(FormContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }
    
    [HttpGet]
    //récupère la liste des formulaires
    public async Task<ActionResult<IEnumerable<FormDTO>>> GetAll() {
        return _mapper.Map<List<FormDTO>>(await _context.Forms.ToListAsync());
    }

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
}