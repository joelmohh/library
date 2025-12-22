const cron = require('node-cron');
const c = require('@joelmo/console-color')();
const Lending = require('../models/Lending');
const User = require('../models/User');
const Book = require('../models/Book');
const { sendEmail, lendingOverdueTemplate, lendingReminderTemplate } = require('./sendEmail');

const checkOverdueLendings = async () => {
    try {
        c.log('cyan', '[CRON] Checking for overdue lendings...');
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const overdueLendings = await Lending.find({
            returned: false,
            returnDate: { $lt: today },
            overdueNotificationSent: false
        }).populate('userId bookId').exec();
        
        c.log('cyan', `[CRON] Found ${overdueLendings.length} overdue lendings without notification`);
        
        for (const lending of overdueLendings) {
            if (!lending.userId || !lending.bookId) {
                c.log('yellow', `[CRON WARNING] Lending ${lending._id} has missing user or book reference`);
                continue;
            }
            
            const returnDate = new Date(lending.returnDate);
            const daysOverdue = Math.floor((today - returnDate) / (1000 * 60 * 60 * 24));
            
            const emailTemplate = lendingOverdueTemplate(
                lending.userId,
                lending.bookId,
                returnDate,
                daysOverdue
            );
            
            const emailResult = await sendEmail(
                lending.userId.email,
                emailTemplate.subject,
                emailTemplate.text,
                emailTemplate.html
            );
            
            if (emailResult.success) {
                lending.overdueNotificationSent = true;
                lending.lastNotificationDate = new Date();
                await lending.save();
                
                c.log('green', `[CRON] Overdue notification sent to ${lending.userId.email} for book "${lending.bookId.title}"`);
            } else {
                c.log('red', `[CRON ERROR] Failed to send overdue notification to ${lending.userId.email}`);
            }
        }
        
        c.log('cyan', '[CRON] Overdue lendings check completed');
        
    } catch (error) {
        c.log('red', '[CRON ERROR] Error checking overdue lendings:', error);
    }
};

const checkUpcomingDueDates = async () => {
    try {
        c.log('cyan', '[CRON] Checking for upcoming due dates...');
        
        const reminderDays = parseInt(process.env.LENDING_REMINDER_DAYS) || 3;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const reminderDate = new Date(today);
        reminderDate.setDate(reminderDate.getDate() + reminderDays);
        reminderDate.setHours(23, 59, 59, 999);
        
        const upcomingLendings = await Lending.find({
            returned: false,
            returnDate: { 
                $gte: today,
                $lte: reminderDate 
            },
            reminderNotificationSent: false
        }).populate('userId bookId').exec();
        
        c.log('cyan', `[CRON] Found ${upcomingLendings.length} lendings with upcoming due dates`);
        
        for (const lending of upcomingLendings) {
            if (!lending.userId || !lending.bookId) {
                c.log('yellow', `[CRON WARNING] Lending ${lending._id} has missing user or book reference`);
                continue;
            }
            
            const returnDate = new Date(lending.returnDate);
            const daysRemaining = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
            
            const emailTemplate = lendingReminderTemplate(
                lending.userId,
                lending.bookId,
                returnDate,
                daysRemaining
            );
            
            const emailResult = await sendEmail(
                lending.userId.email,
                emailTemplate.subject,
                emailTemplate.text,
                emailTemplate.html
            );
            
            if (emailResult.success) {
                lending.reminderNotificationSent = true;
                lending.lastNotificationDate = new Date();
                await lending.save();
                
                c.log('green', `[CRON] Reminder sent to ${lending.userId.email} for book "${lending.bookId.title}"`);
            } else {
                c.log('red', `[CRON ERROR] Failed to send reminder to ${lending.userId.email}`);
            }
        }
        
        c.log('cyan', '[CRON] Upcoming due dates check completed');
        
    } catch (error) {
        c.log('red', '[CRON ERROR] Error checking upcoming due dates:', error);
    }
};

const initializeCronJobs = () => {
    const cronSchedule = process.env.CRON_OVERDUE_CHECK || '0 9 * * *';
    
    cron.schedule(cronSchedule, async () => {
        c.log('cyan', `[CRON] Running scheduled overdue check at ${new Date().toISOString()}`);
        await checkOverdueLendings();
        await checkUpcomingDueDates();
    });
    
    c.log('green', `[CRON] Cron jobs initialized with schedule: ${cronSchedule}`);
    
    setTimeout(async () => {
        c.log('cyan', '[CRON] Running initial check...');
        await checkOverdueLendings();
        await checkUpcomingDueDates();
    }, 10000);
};

const manualCheckOverdue = async () => {
    c.log('cyan', '[MANUAL] Running manual overdue check...');
    await checkOverdueLendings();
};

const manualCheckUpcoming = async () => {
    c.log('cyan', '[MANUAL] Running manual upcoming check...');
    await checkUpcomingDueDates();
};

module.exports = {
    initializeCronJobs,
    checkOverdueLendings,
    checkUpcomingDueDates,
    manualCheckOverdue,
    manualCheckUpcoming
};
