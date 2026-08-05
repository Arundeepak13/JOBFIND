package com.JobFindingPlatform.Service;

import java.util.Properties;

import jakarta.activation.DataHandler;
import jakarta.activation.DataSource;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.Multipart;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.util.ByteArrayDataSource;

import org.springframework.stereotype.Service;

import com.JobFindingPlatform.DTO.EmailRequestDTO;

@Service
public class EmailService {

    public void sendEmail(EmailRequestDTO dto, byte[] pdfBytes) {

        final String fromEmail = "your-email@gmail.com"; // change to your Gmail
        final String password = "your-app-password";     // must be Gmail App Password

        // SMTP Properties
        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");

        // Create a Session with Authenticator
        Session session = Session.getInstance(props, new jakarta.mail.Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(fromEmail, password);
            }
        });

        try {
            // Create message
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(fromEmail));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(dto.getTo()));
            message.setSubject(dto.getSubject());

            // Body Part (text content)
            MimeBodyPart textPart = new MimeBodyPart();
            textPart.setText(dto.getBody());

            // Attachment Part (PDF)
            MimeBodyPart attachmentPart = new MimeBodyPart();
            DataSource dataSource = new ByteArrayDataSource(pdfBytes, "application/pdf");
            attachmentPart.setDataHandler(new DataHandler(dataSource));
            attachmentPart.setFileName("invoice.pdf");

            // Combine parts
            Multipart multipart = new MimeMultipart();
            multipart.addBodyPart(textPart);
            multipart.addBodyPart(attachmentPart);

            // Set content
            message.setContent(multipart);

            // Send email
            Transport.send(message);

            System.out.println("✅ Email sent successfully to: " + dto.getTo());

        } catch (MessagingException e) {
            throw new RuntimeException("❌ Failed to send email", e);
        }
    }
}
