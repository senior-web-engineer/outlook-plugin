const {
  getToken,
  getUploadLink,
  uploadFile,
  getItemsInDirectory,
  getSeafileLibraries,
  downloadFile,
} = require("../helpers/seafile-api");
const {
  getShareOption,
  setShareOption,
  getDefaultPassword,
  setDefaultPassword,
  getDefaultExpireDate,
  setDefaultExpireDate,
} = require("../helpers/addin-config");

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

    jQuery("#update_default_password").on("click", updateDefaultPassword);
    jQuery("#update_share_option").on("click", updateShareOption);
  });

  function updateDefaultPassword() {
    let password = $("#default_password").val();
    if ($("#without_password").prop("checked")) password = null;
    setDefaultPassword(password);

    let expire_date = $("#default_expire").val();
    if ($("#without_expire").prop("checked")) expire_date = null;
    setDefaultExpireDate(expire_date);
  }

  function updateShareOption() {
    let option = "always_default";
    if ($("#ask_for_password").prop("checked")) option = "ask_for_password";
    else if ($("#ask_every_time").prop("checked")) option = "ask_every_time";
    setShareOption(option);
  }
})();
