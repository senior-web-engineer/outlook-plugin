const encryptKey = (str) => {
  return btoa(str);
};

const decryptKey = (str) => {
  return atob(str);
};

export function getConfig() {
  var config = {};

  config.seafile_env = decryptKey(Office.context.roamingSettings.get("seafile_env"));
  config.seafile_username = decryptKey(Office.context.roamingSettings.get("seafile_username"));
  config.seafile_password = decryptKey(Office.context.roamingSettings.get("seafile_password"));
  config.seafile_token = decryptKey(Office.context.roamingSettings.get("seafile_token"));
  return config;
}

export function setConfig(config, callback) {
  Office.context.roamingSettings.set("seafile_env", encryptKey(config.seafile_env));
  Office.context.roamingSettings.set("seafile_username", encryptKey(config.seafile_username));
  Office.context.roamingSettings.set("seafile_password", encryptKey(config.seafile_password));
  Office.context.roamingSettings.set("seafile_token", encryptKey(config.seafile_token));
  Office.context.roamingSettings.saveAsync(callback);
}

export function retriveSeafileEnv() {
  return decryptKey(Office.context.roamingSettings.get("seafile_env"));
}

export function retrieveToken() {
  return decryptKey(Office.context.roamingSettings.get("seafile_token"));
}
