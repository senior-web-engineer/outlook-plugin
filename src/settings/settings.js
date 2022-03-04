const {
  getToken,
  getUploadLink,
  uploadFile,
  getItemsInDirectory,
  getSeafileLibraries,
  downloadFile,
} = require("../helpers/seafile-api");
const {
  retrieveToken,
  retriveSeafileEnv,
  getShareOption,
  setShareOption,
  getDefaultPassword,
  setDefaultPassword,
  getDefaultExpireDate,
  setDefaultExpireDate,
  getdownloadLinkOption,
  setdownloadLinkOption,
  getDefaultAttachmentPath,
  setDefaultAttachmentPath,
  getLinkText,
  setLinkText
} = require("../helpers/addin-config");

// The Office initialize function must be run each time a new page is loaded.
var dirmap = {};
var globalrepos = null;
  
Office.initialize = function (reason) {

    var token = retrieveToken();
    var env = retriveSeafileEnv();
	jQuery(document).ready(function(){
		$(".alert").hide();
		$(".ast").hide();

		jQuery(".sidebar-item").click(function (event) {
		  event.preventDefault();
		  $(".sidebar-item").removeClass("active");
		  $(this).addClass("active");
		  var target = $(this).attr("data-target");
		  $(".side-content").addClass("hide");
		  $(`#${target}`).removeClass("hide");
		});
  
		const shareOption = getShareOption();
		jQuery(`#${shareOption}`).prop("checked", true);
  
		const defaultPassword = getDefaultPassword();
		if (defaultPassword) {
		  $("#with_password").prop("checked", true);
		  $("#default_password").val(defaultPassword);
		} else {
		  $("#without_password").prop("checked", true);
		  $("#default_password").val("");
		}
		const defaultExpireDate = getDefaultExpireDate();
		if (defaultExpireDate) {
		  $("#with_expire").prop("checked", true);
		  $("#default_expire").val(defaultExpireDate);
		} else {
		  $("#without_expire").prop("checked", true);
		  $("#default_expire").val("");
		}
  
		const defaultdownloadLinkoption = getdownloadLinkOption();
		$('#download_link option[value="' + defaultdownloadLinkoption + '"]').prop('selected', true);    
  

		const defaultAttachmentOption = getDefaultAttachmentPath();
		if (defaultAttachmentOption.repo_id == undefined) {
			$('#without_path').prop('checked', true);
		} else {
			$('#with_path').prop('checked', true);
		}
		$('#defaultLibraryname').val(defaultAttachmentOption.defaultLibraryname);
		$('#defaultPathname').val(defaultAttachmentOption.defaultPathname);
		$('#repo_id').val(defaultAttachmentOption.repo_id);

		const link_text = getLinkText();
		$('#link_text').val(link_text);


		$('#select_attachment_path').click(function(){ 

			if ($('.ui-dialog').length == 0) {
				var browse = jQuery("#browser").dialog();
				$('.ui-dialog').appendTo('.button-browse-serverfiles');
			} else {
				$('.ui-dialog').toggle();
			}


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
					"Select As Default Path": function($li){
						//Disable Button until the user select the path.
						$('#select_attachment_path').addClass('disabled')

						console.log('total li length', $li.length);
						filename = $($li).find("span").text();
						path = browse.join(browse.path(), filename);
						repo = getRepofrompath(path);
						relativePath = getRelativepath(path + "/");

						$('#defaultLibraryname').val(repo.name);
						$('#defaultPathname').val(relativePath);
						$('#repo_id').val(repo.id);

						//Enable the button and hide dialog
						$('#select_attachment_path').removeClass('disabled');
						$('.ui-dialog').toggle();

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
			  select: function($li){
				  $('#select_attachment_path').addClass('disabled')

				  console.log('total li length', $li.length);
				  filename = $($li).find("span").text();
				  path = browse.join(browse.path(), filename);
				  repo = getRepofrompath(path);
				  relativePath = getRelativepath(path + "/");

				  $('#defaultLibraryname').val(repo.name);
				  $('#defaultPathname').val(relativePath);
				  $('#repo_id').val(repo.id);

				  //Enable the button and hide dialog
				  $('#select_attachment_path').removeClass('disabled');
				  $('.ui-dialog').toggle();

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
				  	getItemsInDirectory(token, env, repo, relativePath, get(path), refreshRepoMap, callback);
				  	$('.loader').hide();
				}
			  }
			});
		  }
  
		});

		$(".alert").hide();
		jQuery(".sidebar-item").click(function (event) {
		  event.preventDefault();
		  $(".sidebar-item").removeClass("active");
		  $(this).addClass("active");
		  var target = $(this).attr("data-target");
		  $(".side-content").addClass("hide");
		  $(`#${target}`).removeClass("hide");
		});
		$('button#update_general_options span').hide();
		$('button#update_share_option span').hide();
	
		jQuery("button#update_general_options").on("click", updateGeneralOptions);
		jQuery("button#update_share_option").on("click", updateShareOption);
	
		function updateGeneralOptions() {

		  let password = $("#default_password").val();
		  let validate_flag = true;
		  if ($("#without_password").prop("checked")) password = null;
	  
		  if ( $('#with_password').prop("checked") && $('#default_password').val() == "") 
		  {
			  $('#default_password').parent().find(".ast").show();
			  validate_flag = false;
		  }
		  if ( $('#with_expire').prop("checked") && $('#default_expire').val() == "")
		  {
			$('#default_expire').parent().find(".ast").show();			
			validate_flag = false;
		  }

		  if ($('#with_path').prop("checked")) {
			var flag = false;
			if ($('#defaultLibraryname').val()=="" )
			{
			  $('#defaultLibraryname').parent().find(".ast").show();
			  flag = true;

			}
			if ($('#defaultPathname').val()=="" )
			{
			  $('#defaultPathname').parent().find(".ast").show();
			  flag = true;

			}
			if (flag) validate_flag = false;

		  }

		  if (!validate_flag){
			$(window).scrollTop(0);
			return;
		  }

		  $('button#update_general_options span').show();
		  setDefaultPassword(password, function(res){
			if (res.status == "succeeded") {
			  let expire_date = $("#default_expire").val();
			  if ($("#without_expire").prop("checked")) expire_date = null;

			  setDefaultExpireDate(expire_date, function(res){
				if (res.status == "succeeded") {
				  let downloadlink_option = $('select#download_link').val();
				  setdownloadLinkOption(downloadlink_option, function(res){
					if (res.status == "succeeded") {
						console.log($('#defaultLibraryname').val());
						console.log($('#defaultPathname').val());
						console.log($('#repo_id').val());
						
					 let with_path = $('#with_path').prop("checked");
					  setDefaultAttachmentPath(with_path? $('#defaultLibraryname').val(): null, with_path? $('#defaultPathname').val(): null, with_path? $('#repo_id').val() :null, function(res){
						setLinkText($('#link_text').val(), function(res){
							$('button#update_general_options span').hide();	  
							$(".alert-success").fadeTo(2000, 500).slideUp(500, function() {
							  $(".alert-success").slideUp(500);
							});
							$(".ast").hide();
						});


					  });

	  
					}
				  });
				}
			  });
			}
		  });
	  
		}
	  
		function updateShareOption() {
		  $('button#update_share_option span').show();
		  let option = "always_default";
		  if ($("#ask_for_password").prop("checked")) option = "ask_for_password";
		  else if ($("#ask_every_time").prop("checked")) option = "ask_every_time";
		  setShareOption(option, function(res){
			$('button#update_share_option span').hide();
			$(".alert-success").fadeTo(2000, 500).slideUp(500, function() {
			  $(".alert-success").slideUp(500);
			});
		  });
		}
	});

};
