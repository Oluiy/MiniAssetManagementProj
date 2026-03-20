using Mamp_Domain.Model.DTO.Request;
using Mamp_Domain.Model.DTO.Response;

namespace Mamp_Application.Services.Interfaces;

public interface IPropertyManagement
{
    Task<ServiceResponse<PropertyResponse>> CreateProperty(PropertyRequest request, Guid userId);
    Task<ServiceResponse<PropertyResponse>> EditProperty(PropertyRequest request, Guid userId, Guid propertyId);
    Task<ServiceResponse<IEnumerable<PropertyResponse>>> GetProperties(Guid userId);
    Task<ServiceResponse<PropertyResponse>> GetPropertyById(Guid propertyId, Guid userId);
    Task<ServiceResponse> DeleteProperty(Guid propertyId, Guid userId);
}