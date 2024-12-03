using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace prid_2425_a01.Models;

public class InstanceDTO {

    public int Id { get; set; }
    public int FormId { get; set; }
    public Form Form { get; set; } = null!;
    public int UserId { get; set; }
    public User User{ get; set; } = null!;
    public DateTime Started { get; set; }
    public DateTime Completed { get; set; }
    
}

public class Instance_only_DateDTO {
    public DateTime started { get; set; }
    public DateTime Completed {get; set;}
}