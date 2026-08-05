package com.JobFindingPlatform.Service;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.JobFindingPlatform.DTO.PaymentRequestDTO;
import com.JobFindingPlatform.DTO.PaymentResponseDTO;
import com.JobFindingPlatform.Entity.Payment;
import com.JobFindingPlatform.Enum.PaymentStatus;
import com.JobFindingPlatform.Repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepo;

    @Autowired
    private InvoiceService invoiceService;

    public PaymentResponseDTO processPayment(PaymentRequestDTO dto) {
        Payment pay = new Payment();
        pay.setUserId(dto.getUserId());
        pay.setPlanId(dto.getPlanId());
        pay.setAmount(dto.getAmount());
        pay.setPaymentstatus(PaymentStatus.SUCCESS);
        pay.setTransactionId(UUID.randomUUID().toString());
        pay.setTimeStamp(LocalDateTime.now());

        paymentRepo.save(pay);

        byte[] pdfBytes = invoiceService.generateInvoice(pay);

        // Build payload
        MultiValueMap<String, Object> payload = new LinkedMultiValueMap<>();
        payload.add("to", "user@email.com"); // Replace with real user email
        payload.add("subject", "Your ZIDIOConnect Invoice");
        payload.add("body", "Dear User,\n\nThank you for your payment. Please find your invoice attached.");
        payload.add("pdfBytes", Base64.getEncoder().encodeToString(pdfBytes));

        // Set headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Wrap request
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

        // Send request to notification service
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.postForObject(
                "http://localhost:8088/api/notify/send-invoice",
                requestEntity,
                String.class
        );

        
        // Build and return PaymentResponseDTO
        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setTransactionId(pay.getTransactionId());
        response.setPaymentStatus(pay.getPaymentstatus());
        response.setAmount(pay.getAmount());
        return response;
    }
}
