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
using System.Text.Json;

namespace prid_2425_a01.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase {
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UsersController(ApplicationDbContext context, IMapper mapper) {
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

    [Authorized(Role.Admin, Role.User)]
    [HttpGet("optionListsWithNotReferenced/{userId:int}")]
    public async Task<ActionResult<List<OptionList_With_NotReferencedDTO>>> GetOptionListsWithNotReferenced(int userId) {
        // Step 1: Fetch data into memory
        var optionLists = await _context.OptionLists
            .Where(op => op.OwnerId == userId || op.OwnerId == null)
            .Include(op => op.ListOptionValues)
            .ToListAsync();

        // Step 2: Perform the projection in-memory
        var result = optionLists.Select(op => new OptionList_With_NotReferencedDTO {
            Id = op.Id,
            Name = op.Name,
            OwnerId = op.OwnerId,
            NotReferenced = !_context.Questions.Any(q => q.OptionListId == op.Id),
            ListOptionValues = op.ListOptionValues.Select(ov => new OptionValueDTO {
                Idx = ov.Idx,
                Value = ov.Value,
                OptionListId = op.Id
            }).ToList()
        }).ToList();

        return result;
    }

    [Authorized(Role.Admin, Role.User)]
    [HttpDelete("deleteOptionList/{optionListId:int}")]
    public async Task<ActionResult<bool>> DeleteOptionList(int optionListId) {
        var optionList = await _context.OptionLists.FindAsync(optionListId);
        if (optionList == null) {
            return NotFound("OptionList not found.");
        }
        
        _context.OptionLists.Remove(optionList);
        await _context.SaveChangesAsync();
        return true;
    }
    
    [Authorized(Role.Admin, Role.User)]
    [HttpGet("optionList/{optionListId:int}")]
    public async Task<ActionResult<OptionList_With_OptionValuesDTO>> GetOptionList(int optionListId) {
        var optionList = await _context.OptionLists
            .Include(ol => ol.ListOptionValues)
            .FirstOrDefaultAsync(ol => ol.Id == optionListId);
    
        if (optionList == null) {
            return NotFound("OptionList not found.");
        }
        
        var optionListDto = _mapper.Map<OptionList_With_OptionValuesDTO>(optionList);
        return optionListDto;
    }
    
    [Authorized(Role.Admin, Role.User)]
    [HttpPost("createOptionList")]
    public async Task<ActionResult<OptionListDTO>> CreateForm(OptionListDTO optionListDto) {
        var optionList = _mapper.Map<OptionList>(optionListDto);
        
        _context.OptionLists.Add(optionList);
        await _context.SaveChangesAsync();
        return CreatedAtAction("GetOptionList", new { id = optionList.Id }, _mapper.Map<OptionListDTO>(optionList));
    }

    [Authorized(Role.Admin, Role.User)]
    [HttpPut("updateOptionList")]
    public async Task<IActionResult> UpdateForm(OptionList_With_OptionValuesDTO optionListDto) {
        // Load existing OptionList, including its OptionValues
        var existingOptionList = await _context.OptionLists
            .Include(o => o.ListOptionValues) // Include nested collection
            .FirstOrDefaultAsync(f => f.Id == optionListDto.Id);

        if (existingOptionList == null)
            return NotFound();

        // Use AutoMapper to map the DTO to the existing entity
        _mapper.Map(optionListDto, existingOptionList);

        // Save changes to the database
        await _context.SaveChangesAsync();

        return Ok(new { message = "OptionList updated successfully.", form = existingOptionList });
    }
}
