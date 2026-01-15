using AutoDoc.Application.Services;
using AutoDoc.Domain.Interfaces;
using AutoDoc.Infrastructure.Persistence;
using AutoDoc.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuração de logging estruturado padrão
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Configuração do EF Core / PostgreSQL
builder.Services.AddDbContext<AutoDocDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                           ?? "Host=localhost;Port=5432;Database=autodoc;Username=autodoc;Password=autodoc";
    options.UseNpgsql(connectionString);
});

// Repositórios
builder.Services.AddScoped<IPromptRepository, PromptRepository>();
builder.Services.AddScoped<ISessionRepository, SessionRepository>();
builder.Services.AddScoped<IPackageRepository, PackageRepository>();
builder.Services.AddScoped<IAiResultRepository, AiResultRepository>();
builder.Services.AddScoped<IDocumentationRepository, DocumentationRepository>();
builder.Services.AddScoped<IGeminiApiKeyRepository, GeminiApiKeyRepository>();
builder.Services.AddScoped<IIgnoredFilePatternRepository, IgnoredFilePatternRepository>();

// Serviços de aplicação
builder.Services.AddScoped<PromptService>();
builder.Services.AddScoped<SessionService>();
builder.Services.AddScoped<PackageService>();
builder.Services.AddScoped<AiResultService>();
builder.Services.AddScoped<DocumentationService>();
builder.Services.AddScoped<GeminiApiKeyService>();
builder.Services.AddScoped<IgnoreRuleService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configurar limites de requisição maiores para uploads e documentações grandes
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100 MB
    options.ValueLengthLimit = int.MaxValue;
    options.ValueCountLimit = int.MaxValue;
});

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 104857600; // 100 MB
});

// CORS para permitir o front (Vite) - política nomeada e suporte a credenciais
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://localhost:3005") // ajuste conforme seu front
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Habilitar Swagger em todos os ambientes (útil para Docker e desenvolvimento)
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("Frontend");

app.UseHttpsRedirection();

// Autenticação opcional – poderia ser adicionada aqui (JWT / OAuth2)
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();
