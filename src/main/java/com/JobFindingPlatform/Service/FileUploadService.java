package com.JobFindingPlatform.Service;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class FileUploadService {

    private final Cloudinary cloudinary;

    // Use constructor injection and initialize the Cloudinary client directly
    public FileUploadService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName.trim(), // trim whitespace from properties
                "api_key", apiKey.trim(),
                "api_secret", apiSecret.trim()
        ));
    }

    @SuppressWarnings("unchecked")
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap("folder", folder)
        );
        return (String) uploadResult.get("secure_url"); // ✅ correct key name
    }
}
