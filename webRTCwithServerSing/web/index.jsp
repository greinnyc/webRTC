<%-- 
    Document   : cliente
    Created on : 09/07/2019, 08:46:40 AM
    Author     : gangulom
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang = "en"> 
   <head> 
      <meta charset = "utf-8" /> 
   </head>
	
   <body> 
      <div> 
         <input type = "text" id = "loginInput" /> 
         <button id = "loginBtn">Login</button> 
      </div> 
		
      <div> 
         <input type = "text" id = "otherUsernameInput" /> 
         <button id = "connectToOtherUsernameBtn">Establish connection</button> 
      </div> 
		
      <div> 
         <input type = "text" id = "msgInput" /> 
         <button id = "sendMsgBtn">Send text message</button> 
      </div> 
      <div> 
         <input type = "text" id = "showMsg" /> 
      </div> 
		
      <script src = "client.js"></script>
   </body>
	
</html>