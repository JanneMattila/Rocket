using Microsoft.AspNetCore.Mvc;
using Rocket.Web.Hubs;

namespace Rocket.Web.Controllers
{
    [Route("/api/Hub")]
    public class HubController : Controller
    {
        [HttpPost("{id}")]

        public ActionResult Post(string id)
        {
            Startup.HubRoutes.MapHub<GameHub>($"/GameHub{id}");
            return Ok();
        }
    }
}
