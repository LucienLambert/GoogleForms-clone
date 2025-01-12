using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using prid_2425_a01.Helpers;
using prid_2425_a01.Models;
using prid_2425_a01.Models.User;
using System.Security.Claims;

namespace prid_2425_a01.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UserFormAccessesController : ControllerBase {
    private readonly ApplicationDbContext _context;
    private readonly IMapper _mapper;
    
    public UserFormAccessesController(ApplicationDbContext context, IMapper mapper) {
        _context = context;
        _mapper = mapper;
    }

    [Authorized(Role.Admin, Role.User)]
    [HttpPut]
    public async Task<IActionResult> UpdateFormAccess(UserFormAccessDTO_Only_Id userFormAccessDTO) {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(userId!));
        if (currentUser == null)
            return Unauthorized();
        
        var form = _context.Forms.FirstOrDefault(f => f.Id == userFormAccessDTO.FormId);
        
        if (form == null)
            return NotFound();
        
        if (currentUser.Id != form.OwnerId && !currentUser.IsInRole(Role.Admin))
        {
            return Unauthorized();
        }
        
        // if (!_context.UserFormAccesses.Any(uf=>uf.UserId == currentUser.Id && uf.AccessType == AccessType.Editor)&& !currentUser.IsInRole(Role.Admin))
        //     return NotFound();
        
        var formAccessToChange = _context.UserFormAccesses.FirstOrDefault(f => f.FormId == userFormAccessDTO.FormId && f.UserId == userFormAccessDTO.UserId);

        if (formAccessToChange == null) {
            var formAccess = new UserFormAccess {
                FormId = userFormAccessDTO.FormId,
                UserId = userFormAccessDTO.UserId,
                AccessType = userFormAccessDTO.AccessType,
            } ;
            _context.UserFormAccesses.Add(formAccess);
            await _context.SaveChangesAsync();
            return Ok(true);
        } else {
            _context.Entry(formAccessToChange).State = EntityState.Detached;
            _context.UserFormAccesses.Update(_mapper.Map<UserFormAccess>(userFormAccessDTO));
            await _context.SaveChangesAsync();
            return Ok(true);
        }
    }
    
    [Authorized(Role.Admin, Role.User)]
    [HttpDelete("{formid:int}/{userId:int}")]
    public async Task<IActionResult> DeleteUser(int formId, int userId) {
        
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == int.Parse(currentUserId!));
        if (currentUser == null) {
            return Unauthorized();
        }
        
        var form = _context.Forms.FirstOrDefault(f => f.Id == formId);
        if (form == null)
            return NotFound();
        if (currentUser.Id != form.OwnerId && !currentUser.IsInRole(Role.Admin)) 
            return Unauthorized();
        
        var formAccessToRemove = _context.UserFormAccesses.FirstOrDefault(f => f.FormId == formId && f.UserId == userId);
        
        if (formAccessToRemove==null)
            return NotFound();
        
        _context.UserFormAccesses.Remove(formAccessToRemove);
        await _context.SaveChangesAsync();
        
        return Ok(true);
    }
}