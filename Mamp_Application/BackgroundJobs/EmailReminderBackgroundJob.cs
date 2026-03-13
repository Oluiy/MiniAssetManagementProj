using Mamp_Domain.Model.Enum;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;
using Mamp_Infrastructure;

namespace Mamp_Application.BackgroundJobs;

public class EmailReminderBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailReminderBackgroundService> _logger;

    public EmailReminderBackgroundService(IServiceProvider serviceProvider, ILogger<EmailReminderBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Email Reminder Background Service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            // 1. Calculate how long to wait until exactly 8:00 AM
            var now = DateTime.Now;
            var nextRunTime = new DateTime(now.Year, now.Month, now.Day, 8, 0, 0);

            // If it's already past 8:00 AM today, schedule it for 8:00 AM tomorrow
            if (now > nextRunTime)
            {
                nextRunTime = nextRunTime.AddDays(1);
            }

            var delay = nextRunTime - now;
            _logger.LogInformation($"Next email reminder sweep scheduled in {delay.TotalHours:F2} hours.");

            // 2. Put the service to sleep until 8:00 AM
            await Task.Delay(delay, stoppingToken);

            // 3. Wake up and execute the logic!
            try
            {
                await ProcessEmailRemindersAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while sending automated email reminders.");
            }
        }
    }

    private async Task ProcessEmailRemindersAsync()
    {
        _logger.LogInformation("Waking up to process email reminders...");

        // CRITICAL: We must create a scope to safely grab the database context inside a background job
        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MampDbContext>();
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        // Copy-pasted your logic from the NotificationController
        var targetDate = DateTime.UtcNow.AddDays(3);

        var upcomingTasks = await db.MaintenanceTask
            .Include(t => t.User)
            .Include(t => t.Asset)
            .Where(t => t.Status != MaintenanceStatus.Completed 
                     && t.DueDate <= targetDate 
                     && t.DueDate >= DateTime.UtcNow)
            .ToListAsync();

        if (!upcomingTasks.Any())
        {
            _logger.LogInformation("No upcoming tasks found. Going back to sleep.");
            return;
        }

        var tasksByUser = upcomingTasks.GroupBy(t => t.User);
        int emailsSent = 0;

        foreach (var userGroup in tasksByUser)
        {
            var user = userGroup.Key;
            if (user == null || string.IsNullOrEmpty(user.Email)) continue;

            var subject = "Automated Reminder: Upcoming Asset Maintenance Tasks";
            var body = $"Hello {user.Username},\n\nYou have the following maintenance tasks due soon:\n\n";

            foreach (var task in userGroup)
            {
                var assetName = task.Asset?.Name ?? "Unknown Asset";
                body += $"- {task.Title} (Asset: {assetName}) - Due: {task.DueDate:yyyy-MM-dd}\n";
            }

            body += "\nPlease log in to the dashboard to update their status.\n\nThank you.";

            await SendEmailAsync(user.Email, subject, body, config);
            emailsSent++;
        }

        _logger.LogInformation($"Successfully sent {emailsSent} reminder emails.");
    }

    private async Task SendEmailAsync(string toEmail, string subject, string body, IConfiguration config)
    {
        var smtpServer = config["EmailSettings:SmtpServer"];
        var smtpPort = int.Parse(config["EmailSettings:SmtpPort"] ?? "587");
        var senderEmail = config["EmailSettings:SenderEmail"];
        var senderPassword = config["EmailSettings:SenderPassword"];

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