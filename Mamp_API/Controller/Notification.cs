using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;
using Mamp_Infrastructure;
using Mamp_Domain.Model.Enum;

namespace Mamp.Controller;

[ApiController]
[Route("api/[controller]")]
// Note: You might want to lock this down with [Authorize] later, 
// or secure it with an API key if an external cron job is going to trigger it.
public class NotificationController : ControllerBase
{
    private readonly MampDbContext _db;
    private readonly IConfiguration _config;

    public NotificationController(MampDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("SendReminder")]
    public async Task<IActionResult> SendReminder()
    {
        try
        {
            // 1. Define the timeframe (e.g., tasks due within the next 3 days)
            var targetDate = DateTime.UtcNow.AddDays(3);

            // 2. Fetch tasks that are NOT completed and are due soon
            // We Include the User and Asset so we have the email address and asset name
            var upcomingTasks = await _db.MaintenanceTask
                .Include(t => t.User)
                .Include(t => t.Asset)
                .Where(t => t.Status != MaintenanceStatus.Completed 
                         && t.DueDate <= targetDate 
                         && t.DueDate >= DateTime.UtcNow)
                .ToListAsync();

            if (!upcomingTasks.Any())
            {
                return Ok(new { Success = true, Message = "No upcoming maintenance tasks require reminders." });
            }

            // 3. Group tasks by User so we don't spam someone with 5 separate emails
            var tasksByUser = upcomingTasks.GroupBy(t => t.User);

            int emailsSent = 0;

            foreach (var userGroup in tasksByUser)
            {
                var user = userGroup.Key;
                if (user == null || string.IsNullOrEmpty(user.Email)) continue;

                // 4. Build the email content
                var subject = "Reminder: Upcoming Asset Maintenance Tasks";
                var body = $"Hello {user.Username},\n\nYou have the following maintenance tasks due soon:\n\n";

                foreach (var task in userGroup)
                {
                    var assetName = task.Asset?.Name ?? "Unknown Asset";
                    body += $"- {task.Title} (Asset: {assetName}) - Due: {task.DueDate:yyyy-MM-dd}\n";
                }

                body += "\nPlease log in to the dashboard to update their status.\n\nThank you.";

                // 5. Send the email
                await SendEmailAsync(user.Email, subject, body);
                emailsSent++;
            }

            return Ok(new { Success = true, Message = $"Successfully sent {emailsSent} reminder emails." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Message = $"Error sending reminders: {ex.Message}" });
        }
    }

    // Helper method to handle the actual SMTP sending
    private async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var smtpServer = _config["EmailSettings:SmtpServer"];
        var smtpPort = int.Parse(_config["EmailSettings:SmtpPort"] ?? "587");
        var senderEmail = _config["EmailSettings:SenderEmail"];
        var senderPassword = _config["EmailSettings:SenderPassword"];

        using var client = new SmtpClient(smtpServer, smtpPort)
        {
            Credentials = new NetworkCredential(senderEmail, senderPassword),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(senderEmail!, "Asset Management System"),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };

        mailMessage.To.Add(toEmail);

        await client.SendMailAsync(mailMessage);
    }
}