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
  getEmailSetting,
  setEmailSetting,
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

		jQuery('div.custom_green_white_select>div, div.custom_email_settings>div').click(function(){
			$(this).siblings().removeClass('active');
			$(this).addClass('active');
		});



		$(".alert").hide();
		$(".ast").hide();
		$('.field-group button span').hide();
		var emailsetting = getEmailSetting();

		if ( typeof emailsetting !== 'object' ) {
			emailsetting = {};
		}

		////////////////////Password Settings///////////////////////////
		if (getEmailSetting("password")== "ask_every_time") {
			$('#password_content div.ask_every_time').addClass('active');
			emailsetting["password"] = "ask_every_time";
		} else {
			$('#password_content div.always_default').addClass('active');
			emailsetting["password"] = "always_default";
		}
  
		var defaultPassword = getDefaultPassword();
		if (defaultPassword) {
			$('.custom_with_password').addClass('active');
			$('div.custom_with_password input').val(defaultPassword);
		} else {
			$('.custom_without_password').addClass('active');
		}

		jQuery("button.update_password_settings").on("click", function(){
			defaultPassword = $('.custom_without_password').hasClass('active') ? "" : $('div.custom_with_password input').val();
			emailsetting["password"] = $('#password_content div.always_default').hasClass('active') ? "always_default" : "ask_every_time";
			if ($('div.custom_with_password').hasClass('active') && !defaultPassword ) {
				$('div.custom_with_password div.error span').show();
				return;
			}
			$('.update_password_settings').find('span').show();
			setDefaultPassword(defaultPassword, function(res){
				if (res.status == "succeeded") {					
					setEmailSetting( emailsetting, function(res){						
						if (res.status == "succeeded" ) {
							$('.update_password_settings').find('span').hide();
							$("#password_content .alert-success").fadeTo(2000, 500).slideUp(500, function() {
								$("#password_content .alert-success").slideUp(500);
							});
						}

					});

				}
			});
		});




		//////////////////////Expire date settings /////////////////////////
		var defaultExpireDate = getDefaultExpireDate();
		if (defaultExpireDate) {
			$('.custom_with_expire').addClass('active');
			$('.custom_with_expire input').val(defaultExpireDate);
		} else {
			$('.custom_without_expire_date').addClass('active');
		}
		if (getEmailSetting("expire_date")== "ask_every_time") {
			$('#expire_date_content div.ask_every_time').addClass('active');
			emailsetting["expire_date"] = "ask_every_time";
		} else {
			$('#expire_date_content div.always_default').addClass('active');
			emailsetting["expire_date"] = "always_default";
		}
		function isInt(value) {
			return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))
		}
		jQuery("button.update_expire_date_settings").on("click", function(){
			defaultExpireDate = $('.custom_without_expire_date').hasClass('active') ? "" : $('div.custom_with_expire input').val();
			emailsetting["expire_date"] = $('#expire_date_content div.ask_every_time').hasClass('active') ? "ask_every_time" : "always_default";
			if ($('div.custom_with_expire').hasClass('active') && !defaultExpireDate) {
				$('div.custom_with_expire div.error span').text("*This field is required");
				$('div.custom_with_expire div.error span').show();
				return;
			}
			if ($('div.custom_with_expire').hasClass('active') && !isInt(defaultExpireDate) ) {
				$('div.custom_with_expire div.error span').text("*This field should be a numnber format");
				$('div.custom_with_expire div.error span').show();
				return;
			}

			$('.update_expire_date_settings').find('span').show();
			setDefaultExpireDate(defaultExpireDate, function(res){
				if (res.status == "succeeded") {					
					setEmailSetting( emailsetting, function(res){						
						if (res.status == "succeeded" ) {
							$('.update_expire_date_settings').find('span').hide();
							$("#expire_date_content .alert-success").fadeTo(2000, 500).slideUp(500, function() {
								$("#expire_date_content .alert-success").slideUp(500);
							});
						}
					});
				}
			});


		});
		var defaultAttachmentOption = getDefaultAttachmentPath();
		console.log('default attachmentPath ');
		console.log(defaultAttachmentOption);

		if ( !defaultAttachmentOption["defaultLibraryname"] || !defaultAttachmentOption["defaultPathname"] || !defaultAttachmentOption["repo_id"] ) {
			$('.custom_without_path').addClass("active");
		} else {
			$('.custom_with_path').addClass("active");
		}

		if (getEmailSetting("attachment_path")== "ask_every_time") {
			$('#attachment_path_content div.ask_every_time').addClass('active');
			emailsetting["attachment_path"] = "ask_every_time";
		} else {
			$('#attachment_path_content div.always_default').addClass('active');
			emailsetting["attachment_path"] = "always_default";
		}

		jQuery("button.update_attachment_path_settings").on("click", function(){
			if ($('.custom_with_path').hasClass("active") && ( !defaultAttachmentOption["defaultLibraryname"] || !defaultAttachmentOption["defaultPathname"] || !defaultAttachmentOption["repo_id"] ) ){
				$('.custom_with_path').find("span").text("*You need to select a library&path");
				$('.filebrowser_container').css('margin-top', '50px');
				$('.custom_with_path').find("span").show();
				return;
			}
			emailsetting["attachment_path"] = $('#attachment_path_content div.ask_every_time').hasClass("active") ? "ask_every_time": "always_default";
			$('.update_attachment_path_settings').find('span').show();
			setDefaultAttachmentPath( defaultAttachmentOption["defaultLibraryname"] , defaultAttachmentOption["defaultPathname"], defaultAttachmentOption["repo_id"], function(res){
				if (res.status == "succeeded") {
					setEmailSetting( emailsetting, function(res){						
						if (res.status == "succeeded" ) {
							$('.update_attachment_path_settings').find('span').hide();
							$("#attachment_path_content .alert-success").fadeTo(2000, 500).slideUp(500, function() {
								$("#attachment_path_content .alert-success").slideUp(500);
							});
						}

					});
				}
			});
		});

		$('#select_attachment_path, div.custom_with_path').click(function(){ 
			if ($('.ui-dialog').length == 0) {
				var browse = jQuery("#browser").dialog();
				$('.ui-dialog').appendTo('.filebrowser_container');
			} else {
				$('.ui-dialog').show();
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

						defaultAttachmentOption["defaultLibraryname"] = repo.name;
						defaultAttachmentOption["defaultPathname"] = relativePath;
						defaultAttachmentOption["repo_id"]  = repo.id;
						console.log('new defaultAttachmentOption');
						console.log(defaultAttachmentOption);
						$('.filebrowser_container').css('margin-top', '0px');
						$('.custom_with_path').find("span").hide();
						// $('#defaultLibraryname').val(repo.name);
						// $('#defaultPathname').val(relativePath);
						// $('#repo_id').val(repo.id);

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

		var defaultdownloadLinkoption = getdownloadLinkOption();
		switch(defaultdownloadLinkoption) {
			case "1":
				$('#option_filename').prop("checked", true);
				break;
			case "2":
				$('#option_text').prop("checked", true);
				break;
			case "3":
				$('#option_text_filename').prop("checked", true);
				break;
			case "4":
				$('#option_text_link').prop("checked", true);
				break;
			default:
				$('#option_filename').prop("checked", true);
				break;
		}

		var link_text = getLinkText();
		$('.download_link_text input').val(link_text);

		$('button.update_link_text_settings').on("click", function(){
			
			if ( $('#option_filename').prop("checked") ) defaultdownloadLinkoption = "1";
			if ( $('#option_text').prop("checked") ) defaultdownloadLinkoption = "2";
			if ( $('#option_text_filename').prop("checked") ) defaultdownloadLinkoption = "3";
			if ( $('#option_text_link').prop("checked") ) defaultdownloadLinkoption = "4";

			$('button.update_link_text_settings span').show();
			setLinkText(defaultdownloadLinkoption,  function(res){
				if (res.status == "succeeded") { 
					setdownloadLinkOption(defaultdownloadLinkoption, function(res){
						if (res.status == "succeeded") { 
							$('button.update_link_text_settings span').hide();	  
							$("#link_text_content .alert-success").fadeTo(2000, 500).slideUp(500, function() {
								$("#link_text_content .alert-success").slideUp(500);
							});
						}
					});
				}

				$(".ast").hide();
			});
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
		  if ($("#without_password").prop("checked")) password = null;
	  
		  if ( $('#with_password').prop("checked") && $('#default_password').val() == "") 
		  {
			  $('#default_password').parent().find(".ast").show();
			  return;
		  }
		  if ( $('#with_expire').prop("checked") && $('#default_expire').val() == "")
		  {
			$('#default_expire').parent().find(".ast").show();			
			return;
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
			if (flag) return;
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
