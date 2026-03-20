using Mamp_Application.Services.Interfaces;
using Mamp_Domain.Model.DTO.Request;
using Mamp_Domain.Model.DTO.Response;
using Mamp_Domain.Model.Entity;
using Mamp_Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Mamp_Application.Services.Implementations;

public class PropertyManagementService : IPropertyManagement
{
    private readonly MampDbContext _db;

    public PropertyManagementService(MampDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResponse<PropertyResponse>> CreateProperty(PropertyRequest request, Guid userId)
    {
        var response = new ServiceResponse<PropertyResponse>();

        try
        {
            var property = new Property
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Address = request.Address,
                CreatedAt = DateTime.UtcNow
            };

            _db.Property.Add(property);
            await _db.SaveChangesAsync();

            response.Success = true;
            response.Message = "Property created successfully.";
            response.Data = new PropertyResponse
            {
                Id = property.Id,
                Name = property.Name,
                Address = property.Address,
                AssetCount = 0
            };
        }
        catch (Exception ex)
        {
            response.Success = false;
            var actualError = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            response.Message = $"Error creating property: {actualError}";
        }

        return response;
    }

    public async Task<ServiceResponse<IEnumerable<PropertyResponse>>> GetProperties(Guid userId)
    {
        var response = new ServiceResponse<IEnumerable<PropertyResponse>>();

        try
        {
            // We Include Assets just to get an accurate count for the dashboard cards
            var properties = await _db.Property
                .Include(p => p.Assets)
                .Select(p => new PropertyResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Address = p.Address,
                    AssetCount = p.Assets.Count
                })
                .ToListAsync();

            response.Success = true;
            response.Data = properties;
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error fetching properties: {ex.Message}";
        }

        return response;
    }

    public async Task<ServiceResponse<PropertyResponse>> GetPropertyById(Guid propertyId, Guid userId)
    {
        var response = new ServiceResponse<PropertyResponse>();

        try
        {
            var property = await _db.Property
                .Include(p => p.Assets)
                .FirstOrDefaultAsync(p => p.Id == propertyId);

            if (property == null)
            {
                response.Success = false;
                response.Message = "Property not found.";
                return response;
            }

            response.Success = true;
            response.Data = new PropertyResponse
            {
                Id = property.Id,
                Name = property.Name,
                Address = property.Address,
                AssetCount = property.Assets.Count,
                Assets = property.Assets.Select(a => new AssetSummaryResponse
                {
                    Id = a.Id,
                    Name = a.Name,
                    Status = a.Status.ToString()
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error fetching property: {ex.Message}";
        }

        return response;
    }
}