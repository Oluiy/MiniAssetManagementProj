using Mamp_Domain.Model.DTO;
using Mamp_Domain.Model.DTO.Request;
using Mamp_Domain.Model.DTO.Response;

namespace Mamp_Application.Services.Interfaces
{
    public interface IAssetManagement
    {
        Task<ServiceResponse<AssetResponse>> CreateAsset(AssetRequest assetRequest, Guid userId);
        Task<ServiceResponse<AssetResponse>> EditAsset(AssetRequest assetRequest, Guid userId, Guid assetId);
        Task<ServiceResponse<List<AssetResponse>>> GetAllAsset();
        Task<ServiceResponse<AssetResponse>> AssetDetails(Guid assetId);
        Task<ServiceResponse> DeleteAsset(Guid assetId, Guid userId);
    }
}

