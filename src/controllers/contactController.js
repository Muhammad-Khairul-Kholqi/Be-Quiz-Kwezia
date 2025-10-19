const ContactModel = require('../models/contactModel');
const transporter = require('../config/email');

class ContactController {
    static async submitContact(req, res) {
        try {
            const { name, email, message } = req.body;

            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Name is required'
                });
            }

            if (!email || !email.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is required'
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            if (!message || !message.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required'
                });
            }

            const contact = await ContactModel.create({
                name: name.trim(),
                email: email.trim(),
                message: message.trim()
            });

            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, 
                    subject: `New Contact Message from ${name}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #333; border-bottom: 2px solid #146EF5; padding-bottom: 10px;">
                                New Contact Message
                            </h2>
                            
                            <div style="margin: 20px 0;">
                                <p style="margin: 10px 0;">
                                    <strong>From:</strong> ${name}
                                </p>
                                <p style="margin: 10px 0;">
                                    <strong>Email:</strong> 
                                    <a href="mailto:${email}" style="color: #146EF5;">${email}</a>
                                </p>
                                <p style="margin: 10px 0;">
                                    <strong>Date:</strong> ${new Date().toLocaleString()}
                                </p>
                            </div>
                            
                            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                            </div>
                            
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                                <p>This message was sent from your Quiz App contact form.</p>
                                <p>You can reply directly to ${email}</p>
                            </div>
                        </div>
                    `,
                    replyTo: email 
                };

                await transporter.sendMail(mailOptions);

                const confirmationMail = {
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'Thank you for contacting us!',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #146EF5;">Thank You for Contacting Us!</h2>
                            
                            <p>Hi ${name},</p>
                            
                            <p>We have received your message and will get back to you as soon as possible.</p>
                            
                            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 0 0 10px 0;"><strong>Your message:</strong></p>
                                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                            </div>
                            
                            <p>Best regards,<br>Kwizia App Team</p>
                            
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                                <p>This is an automated message. Please do not reply to this email.</p>
                            </div>
                        </div>
                    `
                };

                await transporter.sendMail(confirmationMail);

                res.status(201).json({
                    success: true,
                    message: 'Message sent successfully! We will contact you soon.',
                    data: {
                        id: contact.id,
                        name: contact.name,
                        email: contact.email,
                        created_at: contact.created_at
                    }
                });

            } catch (emailError) {
                console.error('Email sending error:', emailError);
                
                res.status(201).json({
                    success: true,
                    message: 'Message saved, but email notification failed. We will still review your message.',
                    data: {
                        id: contact.id,
                        name: contact.name,
                        email: contact.email,
                        created_at: contact.created_at
                    }
                });
            }

        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to send message',
                error: err.message
            });
        }
    }

    static async getAll(req, res) {
        try {
            const contacts = await ContactModel.getAll();
            res.status(200).json({
                success: true,
                data: contacts
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch contact messages',
                error: err.message
            });
        }
    }

    static async getUnread(req, res) {
        try {
            const contacts = await ContactModel.getUnread();
            res.status(200).json({
                success: true,
                data: contacts
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch unread messages',
                error: err.message
            });
        }
    }

    static async getUnreadCount(req, res) {
        try {
            const count = await ContactModel.getUnreadCount();
            res.status(200).json({
                success: true,
                data: {
                    unread_count: count
                }
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch unread count',
                error: err.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const contact = await ContactModel.getById(id);

            if (!contact) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact message not found'
                });
            }

            res.status(200).json({
                success: true,
                data: contact
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch contact message',
                error: err.message
            });
        }
    }
    static async markAsRead(req, res) {
        try {
            const { id } = req.params;
            
            const existing = await ContactModel.getById(id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact message not found'
                });
            }

            const contact = await ContactModel.markAsRead(id);

            res.status(200).json({
                success: true,
                message: 'Message marked as read',
                data: contact
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to mark message as read',
                error: err.message
            });
        }
    }

    static async markAsUnread(req, res) {
        try {
            const { id } = req.params;
            
            const existing = await ContactModel.getById(id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact message not found'
                });
            }

            const contact = await ContactModel.markAsUnread(id);

            res.status(200).json({
                success: true,
                message: 'Message marked as unread',
                data: contact
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to mark message as unread',
                error: err.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            const existing = await ContactModel.getById(id);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    message: 'Contact message not found'
                });
            }

            await ContactModel.delete(id);

            res.status(200).json({
                success: true,
                message: 'Contact message has been successfully deleted'
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete contact message',
                error: err.message
            });
        }
    }
}

module.exports = ContactController;