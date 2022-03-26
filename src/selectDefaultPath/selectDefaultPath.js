const {
    getToken,
    getUploadLink,
    uploadFile,
    getItemsInDirectory,
    getSeafileLibraries,
    downloadFile,
    advancedDownloadFile,
    getSharedLink,
  } = require("../helpers/seafile-api");
  const {
    retrieveToken,
    retriveSeafileEnv,
    getDefaultPassword,
    getShareOption,
    getDefaultExpireDate,
  } = require("../helpers/addin-config");
  
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

      getSeafileLibraries(token, env, function (repos) {
        window.globalrepos = repos;
        globalrepos = repos;
        for (let repo of repos) {
          if ( repo.encrypted ) continue;
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
      function refreshRepoMap(repo, detail, path, currentEnv, callback) {
        // Adds new direcotry/file to the currentEnv
        for (let item of detail) {
          if (typeof currentEnv[item["name"]] === "object" || typeof currentEnv[item["name"]] === "string") continue;
          if (item.type == "dir") {          
            currentEnv[item["name"]] = {};
          } else {
            currentEnv[item["name"]] = "";
          }
        }
        // Remove delted file or directory from currentEnv      
        for (key in currentEnv){
          let flag = false;
          for (let item of detail) {
            if (item["name"] == key) {
              flag = true; break;
            }
          }
          if (!flag) currentEnv[key] = undefined;
        }
  
        if (callback) callback();
      }
      function getRepofrompath(path) {
        path = path.substring(1);
        let reponame = "";
        if (path.indexOf("/") < 0)
          reponame = path;
         else reponame= path.substring(0, path.indexOf("/"));
         
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
          page_name: "settings",
          menu: function (type) {
            if (type == "li") {
              return {
                "Upload Attachments here": function($li){
      
                  console.log('total li length', $li.length);
                  filename = $($li).find("span").text();
                  path = browse.join(browse.path(), filename);
                  repo = getRepofrompath(path);
                  relativePath = getRelativepath(path + "/");
      
                  var message = {
                    defaultLibraryname: repo.name,
                    defaultPathname : relativePath,
                    repo_id : repo.id,
                    action : "uploadAttach"
                  }
                  Office.context.ui.messageParent(
                    JSON.stringify(message)
                  );

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
          downloadfrommenu: function($li){
              console.log('clicked download button from menu');
          },
          open: function ($li, filename) {
            var file = get(filename);
            if (typeof file == "string") {
              console.log('file double clicked here');  
            } else {
              throw new Error("Invalid filename");
            }
          },
          on_change: function () {
            $("#path").val(this.path());
          },
          refresh: function(path, callback) {
            console.log(path);
            $('.loader').show();
            if (path == "/") {
              getSeafileLibraries(token, env, function (repos) {
                globalrepos = repos;
                // Adds new repo to dirmap 
                for (let repo of repos) {
                  if ( repo.encrypted ) continue;
                  if (typeof dirmap[repo["name"]] === 'object' || typeof dirmap[repo["name"]] === 'string') continue;
                  dirmap[repo["name"]] = {}
                  getItemsInDirectory(token, env, repo, "/", dirmap[repo["name"]], refreshRepoMap);
                }
                // Remove deleted repos from dirmap
                for (let key in dirmap){
                  let flag = false;
                  for (let repo of repos) {
                    if (repo["name"] == key) { flag = true; break;}
                  }
                  if (!flag) dirmap[key] = undefined;
                }
                console.log('dir map', dirmap);

                $('.loader').hide();
                if (callback) callback();
              });
            } else {
              if (path[path.length-1] !="/") path = path + "/";
              let repo = getRepofrompath(path);
              let relativePath = getRelativepath(path);
              let current_env = get(path);
              getItemsInDirectory(token, env, repo, relativePath, current_env, refreshRepoMap, callback);
              $('.loader').hide();
            }
          }
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
  