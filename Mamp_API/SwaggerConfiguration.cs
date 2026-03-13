using System.Reflection;
using Microsoft.OpenApi.Models;


namespace Mamp
{
    public static class SwaggerConfiguration
    {
        public static IServiceCollection RegisterAndConfigureSwaggerAuthorizationOptions(
            this IServiceCollection services)
        {
            services.AddSwaggerGen(x =>
            {
                x.SwaggerDoc("v1", new OpenApiInfo() { Title = "Mamp API", Version = "V1" });
                OpenApiSecurityRequirement security = new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                };

                x.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description =
                        "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "Bearer"
                });

                x.AddSecurityRequirement(security);
                // x.IncludeXmlComments(GetXmlCommentsPath(), includeControllerXmlComments: true);
            });
            return services;
        }

        private static string GetXmlCommentsPath()
        {
            string xmlFileName = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            string filePath = Path.Combine(AppContext.BaseDirectory, xmlFileName);
            return filePath;
        }
    }
}