using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;
using Mamp_Infrastructure;
using Mamp_Domain.Model.Enum; 

namespace Mamp.Controller;

[ApiController]
[Route("api/[controller]")]
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
            var targetDate = DateTime.UtcNow.AddDays(3);

            var upcomingTasks = await _db.MaintenanceTask
                .Include(t => t.User)
                .Include(t => t.Asset)
                .Where(t => t.Status != MaintenanceStatus.Completed 
                         && t.DueDate <= targetDate)
                .ToListAsync();

            if (!upcomingTasks.Any())
            {
                return Ok(new { Success = true, Message = "No upcoming or overdue tasks found." });
            }

            var tasksByUser = upcomingTasks.GroupBy(t => t.User);
            int emailsSent = 0;

            foreach (var userGroup in tasksByUser)
            {
                var user = userGroup.Key;
                if (user == null || string.IsNullOrEmpty(user.Email)) continue;

                var subject = "Action Required: Upcoming Asset Maintenance Tasks";
                
                // The new HTML template!
                var htmlBody = $@"
                <div style=""font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);"">
                    <div style=""background-color: #0f172a; padding: 25px; text-align: center;"">
                        <h2 style=""margin: 0; color: #ffffff; font-size: 24px;"">Maintenance Reminder</h2>
                    </div>
                    <div style=""padding: 30px; background-color: #ffffff; color: #334155;"">
                        <p style=""font-size: 16px; margin-top: 0;"">Hello <strong style=""color: #0f172a;"">{user.Username}</strong>,</p>
                        <p style=""font-size: 16px; line-height: 1.6;"">This is an automated reminder that you have upcoming or overdue maintenance tasks requiring your attention.</p>
                        <div style=""background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 0 6px 6px 0;"">
                            <h3 style=""margin: 0 0 15px 0; color: #0f172a; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;"">Action Required</h3>";

                foreach (var task in userGroup)
                {
                    var assetName = task.Asset?.Name ?? "Unknown Asset";
                    htmlBody += $@"
                            <div style=""margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #cbd5e1;"">
                                <p style=""margin: 5px 0; font-size: 15px;""><strong style=""color: #475569;"">Task:</strong> {task.Title}</p>
                                <p style=""margin: 5px 0; font-size: 15px;""><strong style=""color: #475569;"">Asset:</strong> {assetName}</p>
                                <p style=""margin: 5px 0; font-size: 15px;""><strong style=""color: #475569;"">Due Date:</strong> <span style=""color: #dc2626; font-weight: bold;"">{task.DueDate:yyyy-MM-dd}</span></p>
                            </div>";
                }

                htmlBody += @"
                        </div>
                        <p style=""font-size: 16px; line-height: 1.6;"">Please log in to your dashboard to review the full task details and update the status once the work is completed.</p>
                        <div style=""text-align: center; margin: 35px 0 15px 0;"">
                            <a href=""https://your-frontend-url.com/dashboard"" style=""background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;"">Go to Dashboard</a>
                        </div>
                    </div>
                    <div style=""background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0;"">
                        <p style=""margin: 0;"">This is an automated message from your Asset Management System.</p>
                        <p style=""margin: 5px 0 0 0;"">Please do not reply directly to this email.</p>
                    </div>
                </div>";

                try
                {
                    await SendEmailAsync(user.Email, subject, htmlBody);
                    emailsSent++;
                }
                catch (Exception ex)
                {
                    // Log it but keep going
                    Console.WriteLine($"Failed to send email to {user.Email}: {ex.Message}");
                }
            }

            return Ok(new { Success = true, Message = $"Successfully sent {emailsSent} reminder emails." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Message = $"Error sending reminders: {ex.Message}" });
        }
    }

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

        using var mailMessage = new MailMessage
        {
            From = new MailAddress(senderEmail!, "Asset Management System"),
            Subject = subject,
            Body = body,
            IsBodyHtml = true // This is the magic switch!
        };

        mailMessage.To.Add(toEmail);
        await client.SendMailAsync(mailMessage);
    }
}