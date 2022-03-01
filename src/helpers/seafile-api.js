export function getToken(env, user, password, callback) {
  $.ajax({
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      url: env + "/api2/auth-token/",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        username: user,
        password: password,
      },
    }),
  })
    .done(function (response) {
      if (response.token) {
        callback({
          seafile_env: env,
          seafile_username: user,
          seafile_password: password,
          seafile_token: response.token,
        });
      }
    })
    .fail(function (error) {
      callback(null, error);
    });
}
export function getSeafileLibraries(token, env, callback) {
  $.ajax({
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      url: env + "/api2/repos/",
      method: "GET",
      headers: {
        Authorization: "Token " + token,
        Accept: "application/json; indent=4",
      },
    }),
  })
    .done(function (response) {
      if (callback) callback(response);
    })
    .fail(function (error) {
      console.log("error while getting libraries ", error);
    });
}
export function getItemsInDirectory(token, env, repo, path, currentEnv, callback1, callback2=null) {
  // if (path == "/") console.log("getting info for repo ", repo["name"]);
  if (path !="/") {
    if (path[path.length-1] !="/") path = path + "/";
  }
  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      method: "GET",
      url: env + "/api2/repos/" + repo["id"] + "/dir/" + (path !== "/" ? "?p=" + path : ""),
      headers: {
        Authorization: "Token " + token,
        Accept: "application/json; indent=4",
      },
    }),
  };

  $.ajax(settings)
    .done(function (response) {      
      if (callback1) {
        if (callback2) callback1(repo, response, path, currentEnv, callback2);
        else callback1(repo, response, path, currentEnv);
      }
    })
    .fail(function (error) {
      console.log("error while getting items in direcotry ", repo["name"], path, error);
    });
}

export function getUploadLink(token, env, repo, path, callback) {
  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      method: "GET",
      url: env + "/api2/repos/" + repo["id"] + "/upload-link/" + (path !== "/" ? "?p=" + path : ""),
      headers: {
        Authorization: "Token " + token,
      },
    }),
  };

  $.ajax(settings).done(function (response) {
    console.log("upload Link", response);
    if (callback) callback(response);
  }).fail((err) => {
    console.log(err);
  });
}

export function uploadFile(token, env, uploadPath, relativePath,  selectedFile, callback) {
  var form = new FormData();
  form.append("file", selectedFile, selectedFile.name);
  form.append("parent_dir", relativePath);
  form.append("replace", "1");
  form.append("token", token);
  form.append("url", uploadPath);
  form.append("method", "GET");

  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    processData: false,
    mimeType: "multipart/form-data",
    contentType: false,
    data: form,
  };

  $.ajax(settings).done(function (response) {
    if (callback) callback(response);
  });
}

export function downloadFile(token, env, repo, path, callback) {
  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      method: "GET",
      url: env + "/api2/repos/" + repo["id"] + "/file/?p=" + path + "&reuse=1",
      headers: {
        Authorization: "Token " + token,
        Accept: "application/json; charset=utf-8; indent=4",
      },
    }),
  };

  $.ajax(settings).done(function (response) {
    if (callback) callback(response);
  });
}

export function advancedDownloadFile(
  token,
  env,
  repo,
  path,
  password = null,
  expire_days = null,
  callback = function () {}
) {
  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      method: "POST",
      url: env + "/api/v2.1/share-links/",
      headers: {
        Authorization: "Token " + token,
        Accept: "application/json; charset=utf-8; indent=4",
        "Content-Type": "application/json",
      },
      body: {
        repo_id: repo.id,
        path: path,
        password,
        expire_days,
        permissions: {
          can_download: true,
        },
      },
    }),
  };

  $.ajax(settings).done(function (response) {
    if (callback) callback(response);
  });
}

export function getSharedLink(token, env, repo, path, callback) {
  var settings = {
    url: "https://outlook.lc-testing.de/addin/seafileAPI.php",
    method: "POST",
    timeout: 0,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      method: "GET",
      url: env + `/api/v2.1/share-links/?repo_id=${repo["id"]}&path=${encodeURIComponent(path)}`,
      headers: {
        Authorization: "Token " + token,
        Accept: "application/json",
      },
    }),
  };

  $.ajax(settings)
    .done(function (response) {
      if (callback) callback(response);
    })
    .fail((err) => {
      if (callback) callback([]);
    });
}