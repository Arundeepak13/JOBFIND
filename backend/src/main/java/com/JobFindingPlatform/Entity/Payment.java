package com.JobFindingPlatform.Entity;

import java.time.LocalDateTime;

import com.JobFindingPlatform.Enum.PaymentStatus;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity                                         
@Table(name="payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment { 
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	
	private Long id;
	private Long userId;
	private Long planId;
	
	private Double amount;
	private PaymentStatus paymentstatus;
	private String transactionId;
	private LocalDateTime timeStamp;
	
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public Long getUserId() {
		return userId;
	}
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	public Long getPlanId() {
		return planId;
	}
	public void setPlanId(Long planId) {
		this.planId = planId;
	}
	public Double getAmount() {
		return amount;
	}
	public void setAmount(Double amount) {
		this.amount = amount;
	}
	public PaymentStatus getPaymentstatus() {
		return paymentstatus;
	}
	public void setPaymentstatus(PaymentStatus paymentstatus) {
		this.paymentstatus = paymentstatus;
	}
	public String getTransactionId() {
		return transactionId;
	}
	public void setTransactionId(String transactionId) {
		this.transactionId = transactionId;
	}
	public LocalDateTime getTimeStamp() {
		return timeStamp;
	}
	public void setTimeStamp(LocalDateTime timeStamp) {
		this.timeStamp = timeStamp;
	}
	
	
	
	
}

