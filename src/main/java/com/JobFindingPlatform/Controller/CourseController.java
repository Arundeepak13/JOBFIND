package com.JobFindingPlatform.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.JobFindingPlatform.DTO.CourseDTO;
import com.JobFindingPlatform.Service.CourseService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
	
	@Autowired
	private CourseService courseService;
	
	
	@PostMapping("/add/adminId")
	public ResponseEntity<CourseDTO>addCourse(@RequestBody CourseDTO dto){
		return ResponseEntity.ok(courseService.addCourse(dto));
	}
	
	@PostMapping 
	public ResponseEntity<List<CourseDTO>>getCourse(){
		return ResponseEntity.ok(courseService.getAllActiveCourse());
	}

}
