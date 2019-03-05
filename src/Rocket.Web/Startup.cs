using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Rocket.Web.Hubs;
using Rocket.Web.Services;
using System;

namespace Rocket.Web
{
    public class Startup
    {
#pragma warning disable S1075 // URIs should not be hardcoded
        private const string ErrorHandlingPath = "/Error";
        private const string GameHubPath = "/GameHub";
#pragma warning restore S1075 // URIs should not be hardcoded

        public static HubRouteBuilder HubRoutes { get; private set; }

        private readonly ILogger _logger;
        public Startup(IConfiguration configuration, ILogger<Startup> logger)
        {
            Configuration = configuration;
            _logger = logger;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            _logger.LogInformation("Configuring services");
            services.AddSignalR(options =>
            {
                // Faster pings for testing
                options.KeepAliveInterval = TimeSpan.FromSeconds(5);
            })
            .AddMessagePackProtocol(options =>
            {
                //options.FormatterResolvers
            })
#if DEBUG
            // Add support for Azure SignalR Services
            .AddAzureSignalR()
#endif
            ;

            services.AddApplicationInsightsTelemetry();

            services.AddTransient<ITime, Time>();
            services.AddTransient<IRandomGenerator, RandomGenerator>();
            services.AddSingleton<IGameEngine, GameEngine>();
            services.AddSingleton<GameHubShared>();
            services.AddSingleton<Microsoft.Extensions.Hosting.IHostedService, GameEngineBackgroundService>();
            services.AddMvc();

            _logger.LogInformation("Configuring services completed.");
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            _logger.LogInformation("Configuring");
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler(ErrorHandlingPath);
            }

            app.UseStaticFiles();

#if DEBUG
            // How to use Azure SignalR Service
            app.UseAzureSignalR(routes =>
            {
                routes.MapHub<GameHub>(GameHubPath);
            });
#else
            // How to use SignalR
            app.UseSignalR(routes =>
            {
                routes.MapHub<GameHub>(GameHubPath);
            });
#endif

            app.UseMvc();

            _logger.LogInformation("Configure completed.");
        }
    }
}
