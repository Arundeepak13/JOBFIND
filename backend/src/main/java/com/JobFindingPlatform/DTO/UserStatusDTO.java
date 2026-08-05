package com.JobFindingPlatform.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class UserStatusDTO {
    private int totalJobseekers;
    private int totalRecruiters;
    private int totalBlockUsers;
    private int totalPaidUsers;
    
    
	public int getTotalJobseekers() {
		return totalJobseekers;
	}
	public void setTotalJobseekers(int totalJobseekers) {
		this.totalJobseekers = totalJobseekers;
	}
	public int getTotalRecruiters() {
		return totalRecruiters;
	}
	public void setTotalRecruiters(int totalRecruiters) {
		this.totalRecruiters = totalRecruiters;
	}
	public int getTotalBlockUsers() {
		return totalBlockUsers;
	}
	public void setTotalBlockUsers(int totalBlockUsers) {
		this.totalBlockUsers = totalBlockUsers;
	}
	public int getTotalPaidUsers() {
		return totalPaidUsers;
	}
	public void setTotalPaidUsers(int totalPaidUsers) {
		this.totalPaidUsers = totalPaidUsers;
	}

    

    //    public UserStatusDTO() {}
//
//    public UserStatusDTO(int totalJobseekers, int totalRecruiters, int totalBlockUsers, int totalPaidUsers) {
//        this.totalJobseekers = totalJobseekers;
//        this.totalRecruiters = totalRecruiters;
//        this.totalBlockUsers = totalBlockUsers;
//        this.totalPaidUsers = totalPaidUsers;
//    }

}
