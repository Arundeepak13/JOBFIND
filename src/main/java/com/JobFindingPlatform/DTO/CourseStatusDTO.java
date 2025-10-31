package com.JobFindingPlatform.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseStatusDTO {
	
	private int totalCourse;
	private int activeCourse;
	private int inactiveCourse;
	
	
	public int getTotalCourse() {
		return totalCourse;
	}
	public void setTotalCourse(int totalCourse) {
		this.totalCourse = totalCourse;
	}
	public int getActiveCourse() {
		return activeCourse;
	}
	public void setActiveCourse(int activeCourse) {
		this.activeCourse = activeCourse;
	}
	public int getInactiveCourse() {
		return inactiveCourse;
	}
	public void setInactiveCourse(int inactiveCourse) {
		this.inactiveCourse = inactiveCourse;
	}
	
	

}
