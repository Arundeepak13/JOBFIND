package com.JobFindingPlatform.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {
	
	@Autowired
	private JWTAuthenticationFilter jwtFilter;
	
	@Bean
	public RouteLocator routes(RouteLocatorBuilder builder) {
		return builder.routes()

				.route("auth-service", r -> r.path("/api/auth/**")
                        .uri("http://localhost:7778"))

                .route("jobseeker-service", r -> r.path("/api/job_Seekers/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:7779"))

                .route("recruiter-service", r -> r.path("/api/recruiters/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:7780"))

                .route("jobPost-service", r -> r.path("/api/jobPosts/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:7781"))

                .route("application-service", r -> r.path("/api/applications/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:7782"))

                .route("admin", r -> r.path("/api/admins/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:7783"))

                .route("email-service", r -> r.path("/api/notification/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:7784"))

                .route("fileUpload-service", r -> r.path("/api/upload/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:7785"))

                .route("payment-service", r -> r.path("/api/payment/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:7786"))

                .route("dashBoard-service", r -> r.path("/api/dashBoards/**")
                        .filters(f -> f.filter(jwtFilter))
                        .uri("http://localhost:7787"))

                .build();
						
	}


}