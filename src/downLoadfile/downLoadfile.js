const {
  getToken,
  getUploadLink,
  uploadFile,
  getItemsInDirectory,
  getSeafileLibraries,
  downloadFile,
  advancedDownloadFile,
} = require("../helpers/seafile-api");
const { retrieveToken, retriveSeafileEnv, getDefaultPassword, getShareOption } = require("../helpers/addin-config");

// The Office initialize function must be run each time a new page is loaded.
var dirmap = {};
Office.initialize = function (reason) {
  var token = retrieveToken();
  var env = retriveSeafileEnv();

  jQuery(document).ready(function () {
    var inputPrompt = document.createElement("iframe");
    inputPrompt.style.display = "none";
    document.body.appendChild(inputPrompt);
    window.prompt = inputPrompt.contentWindow.prompt;
    window.alert = inputPrompt.contentWindow.alert;

    var uploadFilebtn = document.getElementById("uploadFilebtn");
    var globalrepos = null;
    var browse = $("#browser").dialog({
      width: 600,
      height: 480,
    });
    window.browse = browse;
    uploadFilebtn.onchange = function (e) {
      if (uploadFilebtn.files.length > 0) {
        $(".loader").show();
        const selectedFile = uploadFilebtn.files[0];
        path = browse.path() + "/";
        repo = getRepofrompath(path);
        relativePath = getRelativepath(path);

        getUploadLink(token, env, repo, relativePath, function (uploadPath) {
          uploadFile(token, env, uploadPath, selectedFile, function (response) {
            $(".loader").hide();
            path = browse.join(browse.path(), selectedFile.name);
            browse.create("file", path);
          });
        });
      }
    };
    getSeafileLibraries(token, env, function (repos) {
      window.globalrepos = repos;
      globalrepos = repos;
      for (let repo of repos) {
        dirmap[repo["name"]] = {};
        getItemsInDirectory(token, env, repo, "/", dirmap[repo["name"]], initRepoMap);
      }
      $(".loader").hide();
      drawRootDirectory();
    });

    function initRepoMap(repo, detail, path, currentEnv) {
      console.log("here is the detail of repo or directory", detail);
      for (let item of detail) {
        if (item.type == "dir") {
          currentEnv[item["name"]] = {};
          getItemsInDirectory(token, env, repo, path + item["name"] + "/", currentEnv[item["name"]], initRepoMap);
        } else {
          currentEnv[item["name"]] = "";
        }
      }
    }

    function getRepofrompath(path) {
      path = path.substring(1);
      let reponame = path.substring(0, path.indexOf("/"));
      for (let repo of globalrepos) {
        if (repo["name"] == reponame) return repo;
      }
    }

    function getRelativepath(path) {
      path = path.substring(1);
      return path.substring(path.indexOf("/"));
    }

    function drawRootDirectory() {
      function get(path) {
        var current = dirmap;
        browse.walk(path, function (file) {
          current = current[file];
        });
        return current;
      }

      browse.browse({
        root: "/",
        separator: "/",
        contextmenu: true,
        menu: function (type) {
          if (type == "li") {
            return {
              "Get Download Link": function ($li) {
                $(".loader").show();
                filename = $li.find("span").text();
                path = browse.join(browse.path(), filename);
                repo = getRepofrompath(path);

                relativePath = getRelativepath(path);

                const shareOption = getShareOption();
                let password = null,
                  expire_days = null;
                if (shareOption === "always_default") {
                  password = getDefaultPassword();
                  expire_days = parseInt(window.prompt("Please input expire days", "10"));
                  if (!expire_days || isNaN(expire_days)) return;
                } else if (shareOption === "ask_for_password") {
                  password = window.prompt("Please input password");
                  if (!password) return;
                } else {
                  password = window.prompt("Please input password");
                  if (!password) return;
                  expire_days = parseInt(window.prompt("Please input expire days", "10"));
                  if (!expire_days || isNaN(expire_days)) return;
                }

                advancedDownloadFile(token, env, repo, relativePath, password, expire_days, function (response) {
                  $(".loader").hide();
                  if (response.error_msg) {
                    window.alert(response.error_msg);
                  } else {
                    Office.context.ui.messageParent(
                      JSON.stringify({
                        downloadLink: response.link,
                      })
                    );
                  }
                });
              },
            };
          } else {
            return {
              "Upload File": function () {
                uploadFilebtn.click();
              },
            };
          }
        },
        dir: function (path) {
          return new Promise(function (resolve, reject) {
            dir = get(path);
            if ($.isPlainObject(dir)) {
              var result = {
                files: [],
                dirs: [],
              };
              Object.keys(dir).forEach(function (key) {
                if (typeof dir[key] == "string") {
                  result.files.push(key);
                } else if ($.isPlainObject(dir[key])) {
                  result.dirs.push(key);
                }
              });
              resolve(result);
            } else {
              reject();
            }
          });
        },
        exists: function (path) {
          return typeof get(path) != "undefined";
        },
        error: function (message) {
          console.log(message);
        },
        create: function (type, path) {
          var m = path.match(/(.*)\/(.*)/);
          var parent = get(m[1]);
          if (type == "directory") {
            parent[m[2]] = {};
          } else {
            parent[m[2]] = "Content of new File";
          }
        },
        remove: function (path) {
          var m = path.match(/(.*)\/(.*)/);
          var parent = get(m[1]);
          delete parent[m[2]];
        },
        rename: function (src, dest) {
          var m = src.match(/(.*)\/(.*)/);
          var parent = get(m[1]);
          var content = parent[m[2]];
          delete parent[m[2]];
          parent[dest.replace(/.*\//, "")] = content;
        },
        open: function (filename) {
          var file = get(filename);
          if (typeof file == "string") {
          } else {
            throw new Error("Invalid filename");
          }
        },
        on_change: function () {
          $("#path").val(this.path());
        },
      });
    }

    function checkDirectoryConfigured(path) {
      let currentEnv = dirmap;
      path = path.substring(1);

      while (path.length) {
        pos = path.indexOf("/");
        dir = path.substring(0, pos);
        currentEnv = currentEnv[dir];
      }
    }
  });
};
