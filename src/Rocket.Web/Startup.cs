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

        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR(options =>
            {
                // Faster pings for testing
                options.KeepAliveInterval = TimeSpan.FromSeconds(5);
            })
            .AddMessagePackProtocol(options =>
            {
                //options.FormatterResolvers
            });

            services.AddLogging(loggingBuilder =>
            {
                loggingBuilder.AddFile(Configuration.GetSection("Logging"));
            });

            services.AddApplicationInsightsTelemetry();

            services.AddTransient<ITime, Time>();
            services.AddTransient<IRandomGenerator, RandomGenerator>();
            services.AddSingleton<IGameEngine, GameEngine>();
            services.AddSingleton<GameHubShared>();
            services.AddSingleton<Microsoft.Extensions.Hosting.IHostedService, GameEngineBackgroundService>();
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler(ErrorHandlingPath);
            }

            loggerFactory.AddApplicationInsights(app.ApplicationServices, LogLevel.Information);

            app.UseStaticFiles();

            app.UseSignalR(routes =>
            {
                HubRoutes = routes;
                routes.MapHub<GameHub>(GameHubPath);
            });

            app.UseMvc();
        }
    }
}
