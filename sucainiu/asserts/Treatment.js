﻿
function AjaxPost(Url,JsonData,LodingFun,ReturnFun){$.ajax({type:"post",url:Url,data:JsonData,dataType:'json',async:'false',beforeSend:LodingFun,error:function(){AjaxErro({"Status":"Erro","Erro":"500"});},success:ReturnFun});}
function ErroAlert(e){var index=layer.alert(e,{icon:5,time:2000,offset:'t',closeBtn:0,title:'错误信息',btn:[],anim:2,shade:0});layer.style(index,{color:'#777'});}
function AjaxErro(e){if(e.Status=="Erro"){switch(e.Erro){case"500":top.location.href='/Erro/Erro500';break;case"100001":ErroAlert("错误 : 错误代码 '10001'");break;default:ErroAlert(e.Erro);}}else{layer.msg("未知错误！");}}
var code="";function createCode(e){code="";var codeLength=4;var selectChar=new Array(1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f','g','h','j','k','l','m','n','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R','S','T','U','V','W','X','Y','Z');for(var i=0;i<codeLength;i++){var charIndex=Math.floor(Math.random()*60);code+=selectChar[charIndex];}
if(code.length!=codeLength){createCode(e);}
if(canGetCookie==1){setCookie(e,code,60*60*60,'/');}else{return code;}}
function setCookie(name,value,hours,path){var name=escape(name);var value=escape(value);var expires=new Date();expires.setTime(expires.getTime()+ hours*3600000);path=path==""?"":";path="+ path;_expires=(typeof hours)=="string"?"":";expires="+ expires.toUTCString();document.cookie=name+"="+ value+ _expires+ path;}
function getCookieValue(name){var name=escape(name);var allcookies=document.cookie;name+="=";var pos=allcookies.indexOf(name);if(pos!=-1){var start=pos+ name.length;var end=allcookies.indexOf(";",start);if(end==-1)end=allcookies.length;var value=allcookies.substring(start,end);return unescape(value);}
else return"-1";}