package com.JobFindingPlatform.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.JobFindingPlatform.DTO.EmailRequestDTO;
import com.JobFindingPlatform.Service.EmailService;

import lombok.RequiredArgsConstructor;

import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class EmailController {

    @Autowired
    private EmailService emailService;

    // ✅ Normal email without attachment
    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestBody EmailRequestDTO dto) {
        emailService.sendEmail(dto, null); // no attachment
        return ResponseEntity.ok("Email sent successfully");
    }

    // ✅ Email with PDF invoice as Base64
    @PostMapping("/send-invoice")
    public ResponseEntity<String> sendInvoice(@RequestBody Map<String, String> payload) {

            // Extract fields from JSON payload
            String to = payload.get("to");
            String subject = payload.get("subject");
            String body = payload.get("body");
            String pdfBase64 = payload.get("pdfBytes");

            // Convert Base64 back to byte[]
            byte[] pdfBytes = Base64.getDecoder().decode(pdfBase64);

            // Create DTO
            EmailRequestDTO request = new EmailRequestDTO(to, subject, body);

            // Call service
            emailService.sendEmail(request, pdfBytes);

            return ResponseEntity.ok("Invoice Email Sent Successfully");
    }
    
//       @PostMapping("/send-invoice")
//       public ResponseEntity<String>sendinvoice(@RequestParam String to 
//    		   ,@RequestParam String subject
//    		   ,@RequestParam String body
//    		   ,@RequestParam String filePath){
//    	   emailService.sendEmail(new EmailRequestDTO(to,subject,body), new File(filePath));
//    	   
//    	   return ResponseEntity.ok("Invoice sent successfully");
//       }
    }

