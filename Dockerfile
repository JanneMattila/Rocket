# This Dockerfile contains Build and Release steps:
# 1. Build image
FROM mcr.microsoft.com/dotnet/core/sdk:2.2.104-alpine3.8 AS build
WORKDIR /source

# Cache nuget restore
COPY /src/Rocket/*.csproj Rocket/
COPY /src/Rocket.Web/*.csproj Rocket.Web/
RUN dotnet restore Rocket.Web/Rocket.Web.csproj

# Copy sources and compile
COPY /src .
WORKDIR /source/Rocket.Web
RUN dotnet publish Rocket.Web.csproj --output /app/ --configuration Release

# 2. Release image
FROM mcr.microsoft.com/dotnet/core/aspnet:2.2.2-alpine3.8
WORKDIR /app
EXPOSE 80

# Copy content from Build image
COPY --from=build /app .

ENTRYPOINT ["dotnet", "Rocket.Web.dll"]
