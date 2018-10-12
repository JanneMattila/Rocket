using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;

namespace Rocket.Web.Services
{
    public class GameEngineBackgroundService : IHostedService
    {
        private readonly ILogger<GameEngineBackgroundService> _logger;
        private readonly IGameEngine _gameEngine;

        public GameEngineBackgroundService(ILogger<GameEngineBackgroundService> logger, IGameEngine gameEngine)
        {
            _logger = logger;
            _gameEngine = gameEngine;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            var stopWatch = Stopwatch.StartNew();
            var update = stopWatch.Elapsed.Ticks;
            
            while (!cancellationToken.IsCancellationRequested)
            {
                var timestamp = stopWatch.Elapsed.Ticks;
                var delta = (timestamp - update) / (double)TimeSpan.TicksPerSecond;

                _logger.LogDebug(LoggingEvents.GameEngineBackgroundServiceDebug, $"Delta: {delta}");

                var updates = _gameEngine.Update(delta);
                update = timestamp;

                if (updates == 0)
                {
                    // Wait for players to join
                    await Task.Delay(100, cancellationToken);
                }
                else
                {
                    // Run game engine all the time.
                    await Task.CompletedTask;
                }
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            return Task.CompletedTask;
        }
    }
}
