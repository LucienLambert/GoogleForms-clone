using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Connections.Features;
using prid_2425_a01.Helpers;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;


using prid_2425_a01.Models;
using System.ComponentModel.DataAnnotations;
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

    [Authorized(Role.User)]
    [HttpGet("all/with_form_accesses/{formId:int}")]
    public async Task<ActionResult<IEnumerable<UserDTO>>> GetAllWithFormAccess(int formId) {
        
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId));
        if (user == null)
            return NotFound();
        
        var form = await _context.Forms.FirstOrDefaultAsync(f => f.Id == formId);
        if (form == null)
            return NotFound();
        if (user.Id != form.OwnerId && !user.IsInRole(role: Role.Admin))
            return Unauthorized();

        var users = _context.Users
            .Include(u => u.ListUserFormAccesses)
            .ToList();
        
        var listuserFormAccessDTO = users
            .Select(u => 
            {
                // Filtrer les UserFormAccess pour ne garder que ceux avec le FormId spécifié
                u.ListUserFormAccesses = u.ListUserFormAccesses
                    .Where(uf => uf.FormId == formId)
                    .ToList();
        
                // Mapper l'utilisateur avec la liste filtrée et inclure le mappage des UserFormAccess
                var userDTO = _mapper.Map<User_Base_With_FormAccessesDTO>(u);
        
                // Mapper explicitement la liste de FormAccesses dans le DTO
                userDTO.FormAccesses = u.ListUserFormAccesses
                    .Select(uf => _mapper.Map<UserFormAccessDTO_Only_Id>(uf))
                    .ToList();

                return userDTO;
            })
            .ToList();

        return Ok(listuserFormAccessDTO);
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

    // Pas le choix pour le signup
    [AllowAnonymous]
    [HttpPut("save")]
    public async Task<IActionResult> AddNewUser(User_Base_With_PasswordDTO userDto) {
        
        // juste au cas où
        userDto.Role = Role.User;
        
        var newUser = _mapper.Map<User_Base_With_PasswordDTO,User>(userDto);
        
        if (newUser != null) {
            
            
            var validator = new UserValidation(_context);
            var result = validator.ValidateOnCreate(newUser).Result;

            if (!result.IsValid) {
                return BadRequest(result);
            }
            
            newUser.Password = TokenHelper.GetPasswordHash(newUser.Password);
            
            await _context.Users.AddAsync(newUser);
            await _context.SaveChangesAsync();
            return Ok(true);
        }
        
        
        return Unauthorized(HttpContext);
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
                Expires = DateTime.UtcNow.AddHours(24),
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
        var userIdCheck = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdCheck) || !int.TryParse(userIdCheck, out int userIdInt)){
            return Unauthorized("User not found");
        }
        
        var currentUser = await _context.Users.Where(u => u.Id == userIdInt).FirstOrDefaultAsync();
        if (currentUser == null){
            return Unauthorized("User not found");
        }
        
        // Step 1: Fetch data into memory
        var optionLists = await _context.OptionLists
            .Where(op => op.OwnerId == userId || op.OwnerId == null)
            .Include(op => op.ListOptionValues)
            .OrderBy(ol => ol.Name.ToLower())
            .Select(op => new OptionList_With_NotReferencedDTO {
                Id = op.Id,
                Name = op.Name,
                OwnerId = op.OwnerId,
                NotReferenced = !_context.Questions.Any(q => q.OptionListId == op.Id),
                ListOptionValues = _mapper.Map<ICollection<OptionValueDTO>>(op.ListOptionValues)
            })
            .ToListAsync();
        
        // Check if it's empty rather than null
        if (!optionLists.Any()) {
            return NotFound("No OptionLists found.");
        }
        
        return optionLists;
    }

    [Authorized(Role.Admin, Role.User)]
    [HttpDelete("deleteOptionList/{optionListId:int}")]
    public async Task<ActionResult<bool>> DeleteOptionList(int optionListId) {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
            return Unauthorized("User not found");
        }
        
        var currentUser = await _context.Users.Where(u => u.Id == userIdInt).FirstOrDefaultAsync();
        if (currentUser == null){
            return Unauthorized("User not found");
        }
        
        var optionList = await _context.OptionLists.FindAsync(optionListId);
        
        if (optionList == null) {
            return NotFound("OptionList not found.");
        }

        if (currentUser.Role != Role.Admin && optionList.OwnerId != currentUser.Id) {
            return Unauthorized("User is not owner of this option list.");
        }
        
        _context.OptionLists.Remove(optionList);
        await _context.SaveChangesAsync();
        return true;
    }

    [Authorized(Role.Admin, Role.User)]
    [HttpGet("optionList/{optionListId:int}")]
    public async Task<ActionResult<OptionList_With_OptionValuesDTO>> GetOptionList(int optionListId) {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
            return Unauthorized("User not found");
        }
        
        var currentUser = await _context.Users.Where(u => u.Id == userIdInt).FirstOrDefaultAsync();
        if (currentUser == null){
            return Unauthorized("User not found");
        }
        
        var optionList = await _context.OptionLists
            .Include(ol => ol.ListOptionValues)
            .FirstOrDefaultAsync(ol => ol.Id == optionListId);
    
        if (optionList == null) {
            return NotFound("OptionList not found.");
        }
        
        if (currentUser.Role != Role.Admin && optionList.OwnerId != currentUser.Id) {
            return Unauthorized("User is not owner of this option list.");
        }
        
        var optionListDto = _mapper.Map<OptionList_With_OptionValuesDTO>(optionList);
        return optionListDto;
    }
    
    [Authorized(Role.Admin, Role.User)]
    [HttpPost("createOptionList")]
    public async Task<ActionResult<OptionList_With_OptionValuesDTO>> CreateOptionList(OptionList_With_OptionValuesDTO optionListDto) {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
            return Unauthorized("User not found");
        }
        
        var currentUser = await _context.Users.Where(u => u.Id == userIdInt).FirstOrDefaultAsync();
        if (currentUser == null){
            return Unauthorized("User not found");
        }
        
        var optionList = _mapper.Map<OptionList>(optionListDto);
        
        var optionListValidationService = new OptionListValidation(_context);
        var result = await optionListValidationService.ValidateOnCreate(optionList);
        
        if (!result.IsValid)
            return BadRequest(result);
        
        
        var optionValueValidation = new OptionValueValidation(_context);
        var optionValueValidationResult = await optionValueValidation.ValidateOnCreate(optionList.ListOptionValues);

        if (!optionValueValidationResult.IsValid) {
            return BadRequest(optionValueValidationResult.Errors);
        }
        
        var lastIdx = optionList.ListOptionValues.Any()
            ? optionList.ListOptionValues.Max(v => v.Idx) + 1 : 1; 
        
        optionList.ListOptionValues.Where(ov => ov.Idx == 0).ToList().ForEach(ov => ov.Idx = lastIdx++);
        
        _context.OptionLists.Add(optionList);
        
        await _context.SaveChangesAsync();
        return CreatedAtAction("GetOptionList", new { optionListId = optionList.Id }, _mapper.Map<OptionList_With_OptionValuesDTO>(optionList));
    }

    [Authorized(Role.Admin, Role.User)]
    [HttpPut("updateOptionList")]
    public async Task<IActionResult> UpdateOptionList(OptionList_With_OptionValuesDTO optionListDto) {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int userIdInt)){
            return Unauthorized("User not found");
        }
        
        var currentUser = await _context.Users.Where(u => u.Id == userIdInt).FirstOrDefaultAsync();
        if (currentUser == null){
            return Unauthorized("User not found");
        }
        
        var existingOptionList = await _context.OptionLists
            .Include(o => o.ListOptionValues)
            .FirstOrDefaultAsync(f => f.Id == optionListDto.Id);

        if (existingOptionList == null)
            return NotFound();

        if (currentUser.Role != Role.Admin && existingOptionList.OwnerId != currentUser.Id) {
            return Unauthorized("User is not owner of this option list.");
        }
        
        _mapper.Map(optionListDto, existingOptionList);
        
        var optionListValidationService = new OptionListValidation(_context);
        var result = await optionListValidationService.ValidateOnCreate(existingOptionList);
        
        if (!result.IsValid)
            return BadRequest(result);
        
        var optionValueValidation = new OptionValueValidation(_context);
        var optionValueValidationResult = await optionValueValidation.ValidateOnCreate(existingOptionList.ListOptionValues);

        if (!optionValueValidationResult.IsValid) {
            return BadRequest(optionValueValidationResult.Errors);
        }

        var lastIdx = existingOptionList.ListOptionValues.Any()
            ? existingOptionList.ListOptionValues.Max(v => v.Idx) + 1 : 1; 
        
        existingOptionList.ListOptionValues.Where(ov => ov.Idx == 0).ToList().ForEach(ov => ov.Idx = lastIdx++);
        
        await _context.SaveChangesAsync();

        return Ok(new { message = "OptionList updated successfully.", form = _mapper.Map<OptionList_With_OptionValuesDTO>(existingOptionList) });
    }
    
    [AllowAnonymous]
    [HttpGet("unicity/email")]
    public async Task<IActionResult> IsEmailUnique(string email) {
        if (string.IsNullOrEmpty(email))
        {
            return BadRequest("Email is required.");
        }
        
        var emailAddressAttribute = new EmailAddressAttribute();
        if (!emailAddressAttribute.IsValid(email))
        {
            return BadRequest("Invalid email format.");
        }
        
        var existingEmail = _context.Users.FirstOrDefault(u => u.Email == email);

        if (existingEmail != null)
        {
            return Conflict("Email already in use.");  // Utilisation de "Conflict" (409) pour indiquer un conflit
        }
        return Ok(true);
    }
    
    
    [AllowAnonymous]
    [HttpGet("unicity/names")]
    public async Task<IActionResult> AreNamesUnique(string names) {
        if (string.IsNullOrEmpty(names))
        {
            return BadRequest("Names are required.");
        }
        
        string[] nameParts = names.Split(' ');

        if (nameParts.Length == 2) // Assurez-vous qu'il y a un prénom et un nom
        {
            string firstName = nameParts[0];
            string lastName = nameParts[1];

            bool exists = _context.Users.Any(user => user.FirstName == firstName && user.LastName == lastName);
            
            if (exists) {
                return Conflict("Names are not unique.");
            }
            else
            {
                return Ok(true);
            }
        }
        else
        {
            return BadRequest("Names are required.");
        }
    }
}
