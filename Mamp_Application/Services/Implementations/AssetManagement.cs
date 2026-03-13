using System.Net;
using Mamp_Application.Services.Interfaces;
using Mamp_Domain.Model.DTO;
using Mamp_Domain.Model.DTO.Request;
using Mamp_Domain.Model.DTO.Response;
using Mamp_Domain.Model.Entity;
using Mamp_Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace Mamp_Application.Services.Implementations;

public class AssetManagement : IAssetManagement
{
    private readonly MampDbContext _db;

    public AssetManagement(MampDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResponse<AssetResponse>> CreateAsset(AssetRequest request, Guid userId)
    {
        var response = new ServiceResponse<AssetResponse>();
        try
        {
            var newAsset = new Asset
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Type = request.Type,
                Location = request.Location,
                Status = request.Status, // Default status on creation
                CreatedAt = DateTime.UtcNow,
                UserId = userId // Links the asset to the logged-in user
            };

            _db.Asset.Add(newAsset);
            await _db.SaveChangesAsync();
            
            var data = new AssetResponse
            {
                Id = newAsset.Id,
                Name = newAsset.Name,
                Type = newAsset.Type,
                Location = newAsset.Location,
                Status = newAsset.Status,
                DateCreated = newAsset.CreatedAt
            };

            response.StatusCode = HttpStatusCode.OK;
            response.Message = "Asset created successfully!";
            response.Success = true;
            response.Data = data;
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error creating asset: {ex.Message}";
        }

        return response;
    }

    public async Task<ServiceResponse<AssetResponse>> EditAsset(AssetRequest request, Guid userId, Guid assetId)
    {
        var response = new ServiceResponse<AssetResponse>();

        try
        {
            var asset = await _db.Asset.SingleOrDefaultAsync(a => a.Id == assetId);

            if (asset == null)
            {
                response.Success = false;
                response.Message = "Asset not found.";
                return response;
            }

            // Optional Security Check: Ensure the user editing the asset is the one who created it
            // If any admin can edit, you can remove this check.
            if (asset.UserId != userId)
            {
                response.Success = false;
                response.Message = "You do not have permission to edit this asset.";
                return response;
            }

            // Apply updates
            asset.Name = request.Name;
            asset.Type = request.Type;
            asset.Location = request.Location;
            asset.Status = request.Status;

            _db.Asset.Update(asset);
            await _db.SaveChangesAsync();
            
            var data = new AssetResponse
            {
                Id = asset.Id,
                Name = asset.Name,
                Type = asset.Type,
                Location = asset.Location,
                Status = asset.Status,
                DateCreated = asset.CreatedAt
            };

            response.Success = true;
            response.Message = "Asset updated successfully.";
            response.Data = data;
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error updating asset: {ex.Message}";
        }

        return response;
    }

    public async Task<ServiceResponse<List<AssetResponse>>> GetAllAsset(Guid userId)
    {
        var response = new ServiceResponse<List<AssetResponse>>();

        try
        {
            // AsNoTracking() improves performance for read-only queries
            var assets = await _db.Asset
                .AsNoTracking()
                .Where(a => a.UserId == userId)
                .Select(a => new AssetResponse
                {
                    Id = a.Id,
                    Name = a.Name,
                    Type = a.Type,
                    Location = a.Location,
                    Status = a.Status,
                    DateCreated = a.CreatedAt
                })
                .ToListAsync();

            response.Data = assets;
            response.Success = true;
            response.Message = "Assets retrieved successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error retrieving assets: {ex.Message}";
        }

        return response;
    }

    public async Task<ServiceResponse<AssetResponse>> AssetDetails(Guid assetId, Guid userId)
    {
        var response = new ServiceResponse<AssetResponse>();

        try
        {
            var asset = await _db.Asset
                .AsNoTracking()
                .Where(a => a.Id == assetId && a.UserId == userId)
                .Select(a => new AssetResponse
                {
                    Id = a.Id,
                    Name = a.Name,
                    Type = a.Type,
                    Location = a.Location,
                    Status = a.Status,
                    DateCreated = a.CreatedAt
                })
                .SingleOrDefaultAsync();

            if (asset == null)
            {
                response.Success = false;
                response.Message = "Asset not found.";
                return response;
            }

            response.Data = asset;
            response.Success = true;
            response.Message = "Asset details retrieved.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            response.Message = $"Error retrieving asset details: {ex.Message}";
        }

        return response;
    }
    
    public async Task<ServiceResponse> DeleteAsset(Guid assetId, Guid userId)
    {
        var response = new ServiceResponse();

        try
        {
            var asset = await _db.Asset.FirstOrDefaultAsync(a => a.Id == assetId);

            if (asset == null)
            {
                response.Success = false;
                response.Message = "Asset not found.";
                return response;
            }

            // Security Check: Only the owner can delete the asset
            if (asset.UserId != userId)
            {
                response.Success = false;
                response.Message = "You do not have permission to delete this asset.";
                return response;
            }

            _db.Asset.Remove(asset);
            await _db.SaveChangesAsync();

            response.Success = true;
            response.Message = "Asset and all associated tasks were deleted successfully.";
        }
        catch (Exception ex)
        {
            response.Success = false;
            var actualError = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            response.Message = $"Error deleting asset: {actualError}";
        }

        return response;
    }
}