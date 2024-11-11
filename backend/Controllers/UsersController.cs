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
public class UsersController : ControllerBase
{
    private readonly FormContext _context;
    private readonly IMapper _mapper;

    public UsersController(FormContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }
    
    //[AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDTO>>> GetAll() {
        // Récupère une liste de tous les users et utilise le mapper pour les transformer en leur DTO
        return _mapper.Map<List<UserDTO>>(await _context.Users.ToListAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDTO>> GetOneById(int id) {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();
        return _mapper.Map<UserDTO>(user);
    }

    [HttpGet("by_email/{email}")]
    public async Task<ActionResult<UserDTO>> GetOneByEmail(string email) {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            return NotFound();
        return _mapper.Map<UserDTO>(user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id) {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut]
    public async Task<IActionResult> PutUser(UserDTO dto) {
        var user = await _context.Users.FindAsync(dto.Id);

        if (user == null)
            return NotFound();

        _mapper.Map<UserDTO, User>(dto, user);

        var result = await new UserValidator(_context).ValidateAsync(user);

        if (!result.IsValid)
            return BadRequest(result);

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
