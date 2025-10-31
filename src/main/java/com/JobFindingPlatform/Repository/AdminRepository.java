package com.JobFindingPlatform.Repository;
//interact with database and retrive the data send back to service
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.JobFindingPlatform.Entity.Admin;

@Repository
public interface AdminRepository extends JpaRepository<Admin,Long> {
	List<Admin>findByAdminId(Long adminId);
	List<Admin>findByUserId(Long userId);
	
}

