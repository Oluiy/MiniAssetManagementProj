FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["Mamp_API/Mamp_API.csproj", "Mamp_API/"]
COPY ["Mamp_Application/Mamp_Application.csproj", "Mamp_Application/"]
COPY ["Mamp_Domain/Mamp_Domain.csproj", "Mamp_Domain/"]
COPY ["Mamp_Infrastructure/Mamp_Infrastructure.csproj", "Mamp_Infrastructure/"]

RUN dotnet restore "Mamp_API/Mamp_API.csproj"

COPY . .

WORKDIR "/src/Mamp_API"
RUN dotnet publish "Mamp_API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Mamp_API.dll"]

