//package com.JobFindingPlatform.ExceptionHandler;
//
//import java.time.LocalDateTime;
//
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.ControllerAdvice;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.context.request.WebRequest;
//
//@ControllerAdvice
//public class GlobalExceptionHandler {
//
//	@ExceptionHandler(ResourceNotFoundException.class)
//	public ResponseEntity<ErrorResponse>handlerResourceNotFound(ResourceNotFoundException ex, WebRequest request){
//
//
//		ErrorResponse error = new ErrorResponse(
//				LocalDateTime.now(),
//				HttpStatus.NOT_FOUND.value(),
//				"Resource Not found",
//				ex.getMessage(),
//				request.getDescription(false));
//
//		return new ResponseEntity<>(error,HttpStatus.NOT_FOUND);
//
//	}
//
//	@ExceptionHandler(ResourceNotFoundException.class)
//	public ResponseEntity<ErrorResponse>handlerGlobalException(Exception ex, WebRequest request){
//
//		ErrorResponse error = new ErrorResponse(
//				LocalDateTime.now(),
//				HttpStatus.INTERNAL_SERVER_ERROR.value(),
//				"Internal ServerError",
//				ex.getMessage(),
//				request.getDescription(false));
//
//		return new ResponseEntity<>(error,HttpStatus.INTERNAL_SERVER_ERROR);
//
//
//	}
//
//}
