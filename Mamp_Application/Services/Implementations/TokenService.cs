using Mamp_Application.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;


namespace Mamp_Application.Services.Implementations
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config) => _config = config;

        //AccessToken
        public string GenerateToken(Guid userId, string? role, string email)
        {
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
            var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(ClaimTypes.Role, role ?? "")
            };

            var expires = DateTime.UtcNow.AddMinutes(int.Parse(_config["Jwt:ExpiryMinutes"] ?? "60"));

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config.GetValue<string>("Jwt:Audience"),
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: expires,
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        //RefreshToken
        public string GenerateRefreshToken()
        {
            var randomByte = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomByte);
            return Convert.ToBase64String(randomByte);
        }

        // public async Task SaveRefreshTokenAsync(int customerId, string token, DateTime expires)
        // {
        //     
        //     _db.RefreshTokens.Add(rt);
        //     await _db.SaveChangesAsync();
        // }
    }
}