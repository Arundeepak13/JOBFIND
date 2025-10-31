package com.JobFindingPlatform.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.JobFindingPlatform.Entity.Course;

@Repository
public interface CourseRepository extends JpaRepository <Course, Long> {
	
	List<Course>findByActiveTrue();

}
