package com.JobFindingPlatform.Security;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import com.JobFindingPlatform.Entity.User;
import com.JobFindingPlatform.Enum.Role;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JWTUtil {

    // 🔑 Must be at least 32 chars for HS512
    private final String secret = "jobfindingKey";
    private final long expirationTime = 86400000; // 1 day in ms

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Generate token using email and role
     */
    public String generateToken(String userEmail, Role role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userEmail)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512) // ✅ fixed
                .compact();
    }

    /**
     * Overloaded method to generate token from User entity
     */
    public String generateToken(User user) {
        return generateToken(user.getUserEmail(), user.getRole());
    }

    /**
     * Extract username/email from token
     */
    public String extractUserName(String token) {
        return Jwts.parserBuilder() // ✅ parserBuilder instead of parser()
                .setSigningKey(getSigningKey()) // ✅ Key, not String
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Validate token signature and expiry
     */
    public boolean validate(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // ✅ Key, not String
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
