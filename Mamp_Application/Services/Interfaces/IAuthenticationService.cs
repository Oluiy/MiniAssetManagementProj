using Mamp_Domain.Model.DTO;
using Mamp_Domain.Model.DTO.Request;
using Mamp_Domain.Model.DTO.Response;
using Mamp_Domain.Model.Entity;

namespace Mamp_Application.Services.Interfaces
{
    public interface IAuthenticationService
    {
        Task<ServiceResponse<SignupResponse>> RegisterUserAsync(SignupRequest signupRequest);
        Task<ServiceResponse<SignupResponse>> LoginAsync(LoginRequest loginRequest);
    }
}

