package com.JobFindingPlatform.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionStatusDTO {
	
	private int totalPayments;
	private int paidUsers;
	private double totalRevenue;
	private double averageRevenuePerUser;
	private int activePlans;
	
	
	
	public int getTotalPayments() {
		return totalPayments;
	}
	public void setTotalPayments(int totalPayments) {
		this.totalPayments = totalPayments;
	}
	public int getPaidUsers() {
		return paidUsers;
	}
	public void setPaidUsers(int paidUsers) {
		this.paidUsers = paidUsers;
	}
	public double getTotalRevenue() {
		return totalRevenue;
	}
	public void setTotalRevenue(double totalRevenue) {
		this.totalRevenue = totalRevenue;
	}
	public double getAverageRevenuePerUser() {
		return averageRevenuePerUser;
	}
	public void setAverageRevenuePerUser(double averageRevenuePerUser) {
		this.averageRevenuePerUser = averageRevenuePerUser;
	}
	public int getActivePlans() {
		return activePlans;
	}
	public void setActivePlans(int activePlans) {
		this.activePlans = activePlans;
	}
	
	
	
	

}
