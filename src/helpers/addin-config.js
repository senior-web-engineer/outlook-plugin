import { useStorage } from "./env.dev";

const encryptKey = (str) => {
  return btoa(str);
};

const decryptKey = (str) => {
  return atob(str);
};

export function getConfig() {
  var config = {};
  if (useStorage){
    config.seafile_env = decryptKey(localStorage.getItem('seafile_env'));
    config.seafile_username = decryptKey(localStorage.getItem('seafile_username'));
    config.seafile_password = decryptKey(localStorage.getItem('seafile_password'));
    config.seafile_token = decryptKey(localStorage.getItem('seafile_token'));
  }
  else {
    config.seafile_env = decryptKey(Office.context.roamingSettings.get("seafile_env"));
    config.seafile_username = decryptKey(Office.context.roamingSettings.get("seafile_username"));
    config.seafile_password = decryptKey(Office.context.roamingSettings.get("seafile_password"));
    config.seafile_token = decryptKey(Office.context.roamingSettings.get("seafile_token"));
  }
  return config;
}

export function setConfig(config, callback) {
  if (useStorage){
    localStorage.setItem("seafile_env", encryptKey(config.seafile_env));
    localStorage.setItem("seafile_username", encryptKey(config.seafile_username));
    localStorage.setItem("seafile_password", encryptKey(config.seafile_password));
    localStorage.setItem("seafile_token", encryptKey(config.seafile_token));
    callback({status:"succeeded"});
  }
  else {
  Office.context.roamingSettings.set("seafile_env", encryptKey(config.seafile_env));
  Office.context.roamingSettings.set("seafile_username", encryptKey(config.seafile_username));
  Office.context.roamingSettings.set("seafile_password", encryptKey(config.seafile_password));
  Office.context.roamingSettings.set("seafile_token", encryptKey(config.seafile_token));
  Office.context.roamingSettings.saveAsync(callback);
  }
}
export function retriveUserName(){
  return decryptKey(useStorage?localStorage.getItem('seafile_username'):Office.context.roamingSettings.get("seafile_username"));
}
export function retriveSeafileEnv() {
  return decryptKey(useStorage?localStorage.getItem('seafile_env'):Office.context.roamingSettings.get("seafile_env"));
}

export function retrieveToken() {
  return decryptKey(useStorage?localStorage.getItem('seafile_token'):Office.context.roamingSettings.get("seafile_token"));
}

export function getDefaultPassword() {
  const password = useStorage?localStorage.getItem('default_password'):Office.context.roamingSettings.get("default_password");
  if (password) return decryptKey(password);
  else return "";

}

export function setDefaultPassword(password = "", callback = function () {}) {
  if (useStorage){
    localStorage.setItem("default_password", encryptKey(password));
    callback({status:"succeeded"});
  }
  else {
  Office.context.roamingSettings.set("default_password", encryptKey(password));
  Office.context.roamingSettings.saveAsync(callback);}
}

export function getDefaultExpireDate() {
  const default_expire_date =  useStorage?localStorage.getItem('default_expire_date'):Office.context.roamingSettings.get("default_expire_date");
  if (default_expire_date) return decryptKey(default_expire_date);
  else return "";
}

export function setDefaultExpireDate(expire_date = "", callback = function () {}) {
  if (useStorage){
    localStorage.setItem("default_expire_date", encryptKey(expire_date));
    callback({status:"succeeded"});
  }
  else {
  Office.context.roamingSettings.set("default_expire_date", encryptKey(expire_date));
  Office.context.roamingSettings.saveAsync(callback);}
}


export function getEmailSetting(key = "" ){
  const option = useStorage?localStorage.getItem('email_setting'):Office.context.roamingSettings.get("email_setting");
  if (key) {
    if (option && option[key]) return option[key];
    else return "always_default";
  } else {
    return option;
  }
}
export function setEmailSetting(val = "", callback = function () {}) {
  if (useStorage){
    localStorage.setItem('email_setting',val);
    callback({status:"succeeded"});
  }
  else {
  Office.context.roamingSettings.set("email_setting", val);
  Office.context.roamingSettings.saveAsync(callback);}
}

export function getShareOption(key = "") {
  const option = useStorage?localStorage.getItem('share_option'):Office.context.roamingSettings.get("share_option");
  if (key !="") {
    if (option && option[key]) return option[key];
    else return "always_default";
  } else {
    return option;
  }
  // if (!option || option === undefined) return "always_default";
  // return option;
}
export function setShareOption(val = "", callback = function () {}) {
  if (useStorage){
    localStorage.setItem('share_option',val);
    callback({status:"succeeded"});
  }
  else {
  Office.context.roamingSettings.set("share_option", val);
  Office.context.roamingSettings.saveAsync(callback);}
}

export function getdownloadLinkOption() {
  const option = useStorage?localStorage.getItem('downloadlink_option'):Office.context.roamingSettings.get("downloadlink_option");
  if (!option || option === undefined) return "1";
  return option;
}

export function setdownloadLinkOption(val = 1, callback = function () {}) {
  if (useStorage){
    localStorage.setItem("downloadlink_option", val);
    callback({status:"succeeded"});
  }
  else {
  Office.context.roamingSettings.set("downloadlink_option", val);
  Office.context.roamingSettings.saveAsync(callback);}
}


export function dataurltoFile(url, filename, mimeType){
  if (url.indexOf("base64") == -1) {
    url = `data:${mimeType};base64,${url}`;
  }
  return (fetch(url)
      .then(function(res){return res.arrayBuffer();})
      .then(function(buf){return new File([buf], filename,{type:mimeType});})
  );
}

export function getDefaultAttachmentPath(){
  return useStorage?{
    defaultLibraryname: localStorage.getItem("defaultLibraryname") ? localStorage.getItem("defaultLibraryname"): "",
    defaultPathname   :  localStorage.getItem("defaultPathname") ? localStorage.getItem("defaultPathname"): "",
    repo_id : localStorage.getItem("repo_id") ? localStorage.getItem("repo_id"): "",
  }:{
    defaultLibraryname: Office.context.roamingSettings.get("defaultLibraryname") ? Office.context.roamingSettings.get("defaultLibraryname"): "",
    defaultPathname   :  Office.context.roamingSettings.get("defaultPathname") ? Office.context.roamingSettings.get("defaultPathname"): "",
    repo_id : Office.context.roamingSettings.get("repo_id") ? Office.context.roamingSettings.get("repo_id"): "",
  }  
}
export function setDefaultAttachmentPath(defaultLibraryname, defaultPathname = "/", repo_id, callback=function(){}){
  if (useStorage){
    localStorage.setItem("defaultLibraryname", defaultLibraryname);
    localStorage.setItem("defaultPathname", defaultPathname);
    localStorage.setItem("repo_id", repo_id);
    callback({status:"succeeded"});
  }
  else {Office.context.roamingSettings.set("defaultLibraryname", defaultLibraryname);
  Office.context.roamingSettings.set("defaultPathname", defaultPathname);
  Office.context.roamingSettings.set("repo_id", repo_id);
  Office.context.roamingSettings.saveAsync(callback);}
}

export function getLinkText(){
  if(useStorage) 
  return localStorage.getItem("link_text")?localStorage.getItem("link_text"):"Download Link";
  else
  return Office.context.roamingSettings.get("link_text")?Office.context.roamingSettings.get("link_text"): "Download Link";
}
export function setLinkText(text, callback=function(){} ) {
  if (useStorage){
    localStorage.setItem('link_text',text);
    callback({status:"succeeded"});
  }
  else {
  Office.context.roamingSettings.set("link_text", text);
  Office.context.roamingSettings.saveAsync(callback);}
}


export function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

