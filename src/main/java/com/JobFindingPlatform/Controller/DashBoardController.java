package com.JobFindingPlatform.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.JobFindingPlatform.DTO.ApplicationStatusDTO;
import com.JobFindingPlatform.DTO.CourseStatusDTO;
import com.JobFindingPlatform.DTO.JobPostStatusDTO;
import com.JobFindingPlatform.DTO.SubscriptionStatusDTO;
import com.JobFindingPlatform.DTO.UserStatusDTO;
import com.JobFindingPlatform.Service.DashBoardService;

@RestController
@RequestMapping("/api/dashBoarads")
public class DashBoardController {
	
	@Autowired
	private DashBoardService dashBoardService;
	
	
	@GetMapping("/jobs")
	public ResponseEntity<JobPostStatusDTO>fetchJobs(){
		return ResponseEntity.ok(dashBoardService.fetechJobStatus());
	}

	@GetMapping("/applications")
	public ResponseEntity<ApplicationStatusDTO>fetchApplication(){
		return ResponseEntity.ok(dashBoardService.fetchApplicationStatus());
	}
	
	@GetMapping("/users")
	public ResponseEntity<UserStatusDTO>fetchUsers(){
		return ResponseEntity.ok(dashBoardService.fetchUsersStatus());
	}
	
	@GetMapping("/courses")
	public ResponseEntity<CourseStatusDTO>fetchCourseStatus(){
		return ResponseEntity.ok(dashBoardService.fetchCourseStatus());
	}
	
	@GetMapping("/subscription")
	public ResponseEntity<SubscriptionStatusDTO>fetchSubscriptioStatus(){
		return ResponseEntity.ok(dashBoardService.fetchSubscriptionStatus());
	}
	
	
}