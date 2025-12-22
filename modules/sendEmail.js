const nodemailer = require('nodemailer');
const c = require('@joelmo/console-color')();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (to, subject, text, html = null) => {
    try {
        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'Library System'}" <${process.env.SMTP_FROM_EMAIL}>`,
            to,
            subject,
            text,
            html: html || text
        };

        const info = await transporter.sendMail(mailOptions);
        c.log('green', `[EMAIL] Email sent successfully to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        c.log('red', `[EMAIL ERROR] Failed to send email to ${to}:`, error);
        return { success: false, error: error.message };
    }
};

const passwordResetTemplate = (email, token, resetUrl) => {
    const subject = 'Password Reset - Library System';
    const text = `
Hello,

You requested a password reset for your Library System account.

To reset your password, access the link below:
${resetUrl}?token=${token}

This link is valid for 1 hour.

If you did not request this reset, please ignore this email.

Best regards,
Library System Team
    `;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Library System</h1>
        </div>
        <div class="content">
            <h2>Password Reset</h2>
            <p>Hello,</p>
            <p>You requested a password reset for your Library System account.</p>
            <p>To reset your password, click the button below:</p>
            <a href="${resetUrl}?token=${token}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background-color: #eee; padding: 10px;">${resetUrl}?token=${token}</p>
            <p><strong>This link is valid for 1 hour.</strong></p>
            <p>If you did not request this reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Library System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
    
    return { subject, text, html };
};

const lendingOverdueTemplate = (user, book, returnDate, daysOverdue) => {
    const subject = `Overdue Loan - "${book.title}"`;
    const text = `
Hello ${user.name},

This is a reminder that the loan for the book "${book.title}" is overdue.

Due date: ${returnDate.toLocaleDateString('en-US')}
Days overdue: ${daysOverdue}

Please return the book as soon as possible.

Best regards,
Library System Team
    `;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .book-info { background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Overdue Loan</h1>
        </div>
        <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>This is a reminder that the loan for the book below is overdue:</p>
            <div class="book-info">
                <h3>📚 ${book.title}</h3>
                ${book.author ? `<p><strong>Author:</strong> ${book.author}</p>` : ''}
                ${book.isbn ? `<p><strong>ISBN:</strong> ${book.isbn}</p>` : ''}
            </div>
            <div class="warning">
                <p><strong>Due date:</strong> ${returnDate.toLocaleDateString('en-US')}</p>
                <p><strong>Days overdue:</strong> ${daysOverdue}</p>
            </div>
            <p>Please return the book to the library as soon as possible.</p>
            <p>If you have already returned it, please disregard this email.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Library System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
    
    return { subject, text, html };
};

const lendingReminderTemplate = (user, book, returnDate, daysRemaining) => {
    const subject = `Reminder: Return "${book.title}" in ${daysRemaining} days`;
    const text = `
Hello ${user.name},

This is a reminder that the return deadline for the book "${book.title}" is approaching.

Due date: ${returnDate.toLocaleDateString('en-US')}
Days remaining: ${daysRemaining}

Please remember to return the book on time.

Best regards,
Library System Team
    `;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .info { background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
        .book-info { background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Return Reminder</h1>
        </div>
        <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>This is a reminder that the return deadline for the book below is approaching:</p>
            <div class="book-info">
                <h3>📚 ${book.title}</h3>
                ${book.author ? `<p><strong>Author:</strong> ${book.author}</p>` : ''}
                ${book.isbn ? `<p><strong>ISBN:</strong> ${book.isbn}</p>` : ''}
            </div>
            <div class="info">
                <p><strong>Due date:</strong> ${returnDate.toLocaleDateString('en-US')}</p>
                <p><strong>Days remaining:</strong> ${daysRemaining}</p>
            </div>
            <p>Please remember to return the book on time to avoid fines or penalties.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Library System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
    
    return { subject, text, html };
};

module.exports = {
    sendEmail,
    passwordResetTemplate,
    lendingOverdueTemplate,
    lendingReminderTemplate
};
