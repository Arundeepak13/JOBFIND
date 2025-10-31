package com.JobFindingPlatform.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.JobFindingPlatform.Service.ChatLoggerService;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
	
	@Autowired
	private ChatLoggerService chatLoggerService;
	
	public WebSocketConfig(ChatLoggerService chatLoggerService) {
		this.chatLoggerService = chatLoggerService;
	}
	
//	@Override
	public void registerStompEndpoint(StompEndpointRegistry register) {
		chatLoggerService.logConnection("Register STOMP Endpoint");
		register.addEndpoint("/ws-chat").setAllowedOriginPatterns("*").withSockJS();
	}
	
	public void configureMessgeBroker(MessageBrokerRegistry register) {
		chatLoggerService.logConnection("Configuring Message Broker");
		register.enableSimpleBroker("/topic");
		register.setApplicationDestinationPrefixes("/app");
	}

}
