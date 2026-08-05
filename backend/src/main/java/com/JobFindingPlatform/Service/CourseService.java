package com.JobFindingPlatform.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.JobFindingPlatform.DTO.CourseDTO;
import com.JobFindingPlatform.Entity.Course;
import com.JobFindingPlatform.Repository.CourseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourseService {
	
	@Autowired
	private CourseRepository courseRepo;
	
	
	public CourseDTO addCourse(CourseDTO dto) {
		Course course = new Course();
		course.setCourseTitle(dto.getCourseTitle());
		course.setCourseDescription(dto.getCourseDescription());
		course.setCourseCategory(dto.getCourseCategory());
		course.setAdminId(dto.getAdminId());
		course.setCreatedAt(LocalDateTime.now());
		course.setActive(true);
		
		
		courseRepo.save(course);
		
		dto.setId(course.getId());
		dto.setAdminId(course.adminId);
		dto.setActive(course.isActive());
		return dto;	
	}
	
	public List<CourseDTO>getAllActiveCourse(){
		return courseRepo.findByActiveTrue().stream().map(c->{
			                     CourseDTO dto = new CourseDTO();
		                         dto.setId(c.getId());
	                          	 dto.setCourseTitle(c.getCourseTitle());
			                     dto.setCourseDescription(c.getCourseDescription());
			                     dto.setCourseCategory(c.getCourseCategory());
			                     dto.setAdminId(c.getAdminId());
			                     dto.setActive(c.isActive());		
			                     return dto;
			
		}).collect(Collectors.toList());
	}
	
	public void deActiveCourse(Long id) {
		
		Course course =  courseRepo.findById(id).orElseThrow(()-> new RuntimeException("Course not found"));
		course.setActive(false);
		
		courseRepo.save(course);
		
	}

}
