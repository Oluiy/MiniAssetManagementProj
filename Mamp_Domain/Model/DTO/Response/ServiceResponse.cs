using System.Net;

namespace Mamp_Domain.Model.DTO
{
    public record ServiceResponse
    {
        public HttpStatusCode StatusCode = HttpStatusCode.OK;
        public bool Success { get; set; }
        public string? Message { get; set; }
    }
    
    public record ServiceResponse<T>
    {
        public HttpStatusCode StatusCode = HttpStatusCode.OK;
        public bool Success { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
    }
}

