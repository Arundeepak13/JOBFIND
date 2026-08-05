package com.JobFindingPlatform.Service;
//all the business logic specified here
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.JobFindingPlatform.DTO.AdminDTO;
import com.JobFindingPlatform.Entity.Admin;
import com.JobFindingPlatform.Repository.AdminRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {
	
	@Autowired
	private AdminRepository adminRepo;
	public Admin performanceAction(AdminDTO dto) {
		
		Admin admin = new Admin();
		admin.setAdminId(dto.getAdminId());
		admin.setUserId(dto.getUserId());
		admin.setAction(dto.getAction());
		admin.setTimeStamp(LocalDateTime.now());
		
		return adminRepo.save(admin);
		
	}
	
	public List<Admin>getactionsByAdmin(Long adminId){
		return adminRepo.findByAdminId(adminId);
	}
	
	
	public List<Admin>getActionsByUser(Long userId){
		return adminRepo.findByUserId(userId);
	}

}
