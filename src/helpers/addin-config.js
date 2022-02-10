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

export function getDefaultPassword() {
  const is_password_set = Office.context.roamingSettings.get("is_password_set");
  return is_password_set === "true" ? decryptKey(Office.context.roamingSettings.get("default_password")) : null;
}

export function setDefaultPassword(password = null, callback = function () {}) {
  if (password === null || password.length <= 0) {
    Office.context.roamingSettings.set("is_password_set", "false");
  } else {
    Office.context.roamingSettings.set("is_password_set", "true");
    Office.context.roamingSettings.set("default_password", encryptKey(password));
  }
  Office.context.roamingSettings.saveAsync(callback);
}

export function getDefaultExpireDate() {
  const is_expire_date_set = Office.context.roamingSettings.get("is_expire_date_set");
  return is_expire_date_set === "true" ? decryptKey(Office.context.roamingSettings.get("default_expire_date")) : null;
}

export function setDefaultExpireDate(expire_date = null, callback = function () {}) {
  if (expire_date === null || expire_date <= 0) {
    Office.context.roamingSettings.set("is_expire_date_set", "false");
  } else {
    Office.context.roamingSettings.set("is_expire_date_set", "true");
    Office.context.roamingSettings.set("default_expire_date", encryptKey(expire_date));
  }
  Office.context.roamingSettings.saveAsync(callback);
}

export function getShareOption() {
  const option = Office.context.roamingSettings.get("share_option");
  if (!option || option === undefined) return "always_default";
  return option;
}

export function setShareOption(val = "always_default", callback = function () {}) {
  Office.context.roamingSettings.set("share_option", val);
  Office.context.roamingSettings.saveAsync(callback);
}
