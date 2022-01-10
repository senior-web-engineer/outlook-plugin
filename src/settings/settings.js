const {
  getToken,
  getUploadLink,
  uploadFile,
  getItemsInDirectory,
  getSeafileLibraries,
  downloadFile,
} = require("../helpers/seafile-api");
const { getConfig, setConfig, retriveSeafileEnv, retrieveToken } = require("../helpers/addin-config");

(function () {
  "use strict";
  // The Office initialize function must be run each time a new page is loaded.
  Office.initialize = function (reason) {
    jQuery(document).ready(function () {
      $(".alert").hide();
      jQuery(".sidebar-item").click(function (event) {
        event.preventDefault();
        $(".sidebar-item").removeClass("active");
        $(this).addClass("active");
        var target = $(this).attr("data-target");
        $(".side-content").addClass("hide");
        $(`#${target}`).removeClass("hide");
      });
    });
  };
  jQuery(document).ready(function () {
    $(".alert").hide();
    jQuery(".sidebar-item").click(function (event) {
      event.preventDefault();
      $(".sidebar-item").removeClass("active");
      $(this).addClass("active");
      var target = $(this).attr("data-target");
      $(".side-content").addClass("hide");
      $(`#${target}`).removeClass("hide");
    });
  });
})();
