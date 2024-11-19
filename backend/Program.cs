using Microsoft.EntityFrameworkCore;
using prid_2425_a01.Models;
using AutoMapper;
using AutoMapper.EquivalencyExpression;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddDbContext<FormContext>(opt => opt.UseSqlite("Data Source=prid-2425-a01.db"));

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Add security definition for Bearer token
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Please enter your JWT token",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        BearerFormat = "JWT"
    });

    // Add security requirement to apply the Bearer token globally
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});


// Auto Mapper Configurations
builder.Services.AddScoped(provider => new MapperConfiguration(cfg => {
    cfg.AddProfile(new MappingProfile(provider.GetService<FormContext>()!));
    // see: https://github.com/AutoMapper/AutoMapper.Collection
    cfg.AddCollectionMappers();
}).CreateMapper());

//------------------------------ 
// configure jwt authentication 
//------------------------------ 

// Notre clé secrète pour les jetons sur le back-end 
var key = Encoding.ASCII.GetBytes("my-super-secret-key my-super-secret-key");
// On précise qu'on veut travaille avec JWT tant pour l'authentification  
// que pour la vérification de l'authentification 
builder.Services.AddAuthentication(x => {
        x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(x => {
        // On exige des requêtes sécurisées avec HTTPS 
        x.RequireHttpsMetadata = true;
        x.SaveToken = true;
        // On précise comment un jeton reçu doit être validé 
        x.TokenValidationParameters = new TokenValidationParameters {
            // On vérifie qu'il a bien été signé avec la clé définie ci-dessous 
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            // On ne vérifie pas l'identité de l'émetteur du jeton 
            ValidateIssuer = false,
            // On ne vérifie pas non plus l'identité du destinataire du jeton 
            ValidateAudience = false,
            // Par contre, on vérifie la validité temporelle du jeton 
            ValidateLifetime = true,
            // On précise qu'on n'applique aucune tolérance de validité temporelle 
            ClockSkew = TimeSpan.Zero  //the default for this setting is 5 minutes 
        };
        // On peut définir des événements liés à l'utilisation des jetons 
        x.Events = new JwtBearerEvents {
            // Si l'authentification du jeton est rejetée ... 
            OnAuthenticationFailed = context => {
                // ... parce que le jeton est expiré ... 
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException)) {
                    // ... on ajoute un header à destination du frontend indiquant cette expiration 
                    context.Response.Headers.Add("Token-Expired", "true");
                }
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Seed the database
using var scope = app.Services.CreateScope();
using var context = scope.ServiceProvider.GetService<FormContext>();
if (context?.Database.IsSqlite() == true)
    /*
    La suppression complète de la base de données n'est pas possible si celle-ci est ouverte par un autre programme,
    comme par exemple "DB Browser for SQLite" car les fichiers correspondants sont verrouillés.
    Pour contourner ce problème, on exécute cet ensemble de commandes qui vont supprimer tout le contenu de la DB.
    La dernière commande permet de réduire la taille du fichier au minimum.
    (voir https://stackoverflow.com/a/548297)
    */
    context.Database.ExecuteSqlRaw(
        @"PRAGMA writable_schema = 1;
          delete from sqlite_master where type in ('table', 'index', 'trigger', 'view');
          PRAGMA writable_schema = 0;
          VACUUM;");
else
    context?.Database.EnsureDeleted();
context?.Database.EnsureCreated();


// Seed the database
var seedData = new SeedData(context!);
seedData.Seed();



app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();