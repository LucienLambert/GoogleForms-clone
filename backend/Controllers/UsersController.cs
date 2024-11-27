using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using prid_2425_a01.Helpers;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;


using prid_2425_a01.Models;
namespace prid_2425_a01.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase {
    private readonly FormContext _context;
    private readonly IMapper _mapper;

    public UsersController(FormContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }
    
    [Authorized(Role.Admin)]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDTO>>> GetAll() {
        // Récupère une liste de tous les users et utilise le mapper pour les transformer en leur DTO
        return _mapper.Map<List<UserDTO>>(await _context.Users.ToListAsync());
    }

    
    [HttpGet("logged_user")]
    public async Task<ActionResult<UserDTO>> GetLoggedUser() {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId));
        if (user == null)
            return NotFound();
        return _mapper.Map<UserDTO>(user);
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

    [Authorized(Role.Admin)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id) {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
            return NotFound();

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorized(Role.Admin)]
    [HttpPut]
    public async Task<IActionResult> PutUser(UserDTO dto) {
        var user = await _context.Users.FindAsync(dto.Id);

        if (user == null)
            return NotFound();

        _mapper.Map<UserDTO, User>(dto, user);

        var result = await new UserValidation(_context).ValidateAsync(user);

        if (!result.IsValid)
            return BadRequest(result);

        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [AllowAnonymous]
    [HttpPost("authenticate")]
    public async Task<ActionResult<UserDTO>> Authenticate(User_With_PasswordDTO dto) {
        var user = await Authenticate(dto.Email, dto.Password);

        var result = await new UserValidation(_context).ValidateForAuthenticate(user);
        if (!result.IsValid)
            return BadRequest(result);

        return Ok(_mapper.Map<UserDTO>(user));
    }

    private async Task<User?> Authenticate(string email, string password) {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        // return null if member not found
        if (user == null)
            return null;

        if (user.Password == TokenHelper.GetPasswordHash(password)) {
            // authentication successful so generate jwt token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("my-super-secret-key my-super-secret-key");
            var tokenDescriptor = new SecurityTokenDescriptor {
                Subject = new ClaimsIdentity(new Claim[] {
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role.ToString()),
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
                }),
                IssuedAt = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddMinutes(10),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            user.Token = tokenHandler.WriteToken(token);
        }

        return user;
    }
    
    
}
