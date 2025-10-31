package com.JobFindingPlatform.Controller;

import java.time.LocalDateTime;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.JobFindingPlatform.Entity.ChatSupport;

@RestController
@RequestMapping("/support")
public class ChatSupportController {
	
	@MessageMapping("/SendMessage")
	@SendTo("/topic/message")
	public ChatSupport sendMessage(ChatSupport message) {
		message.setTimeStamp(LocalDateTime.now());
		return message;
	}

}
