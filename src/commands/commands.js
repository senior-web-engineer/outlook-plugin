/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

const { getConfig, setConfig } = require("../helpers/addin-config");

/* global global, Office, self, window */

var config;
var loginEvent, attachEvent, uploadEvent, settingsEvent;
var loginDialog, attachDialog, uploadDialog, settingsDialog;

Office.onReady(() => {
  // If needed, Office.js is ready to be called
});

/**
 * Shows a notification when the add-in command is executed.
 * @param event {Office.AddinCommands.Event}
 */
function uploadattachment(event) {
  config = getConfig();

  if (config && config.seafile_env) {
    loadUploadPage(event);
  } else {
    login(event);
  }
  // Show a notification message
  // Office.context.mailbox.item.notificationMessages.replaceAsync("uploadattachment", message);

  // Be sure to indicate when the add-in command function is complete
}

function Attach(event) {
  config = getConfig();
  if (config && config.seafile_env) {
    loadAttachPage(event);
  } else {
    login(event);
  }
}

function login(event) {
  loginEvent = event;

  var url = new URI("login.html").absoluteTo(window.location).toString();
  var dialogOptions = { width: 25, height: 50, displayInIframe: true };

  Office.context.ui.displayDialogAsync(url, dialogOptions, function (result) {
    loginDialog = result.value;

    loginDialog.addEventHandler(Office.EventType.DialogMessageReceived, receiveMessage);
    loginDialog.addEventHandler(Office.EventType.DialogEventReceived, dialogClosed);
  });
}

function loadUploadPage(event) {
  uploadEvent = event;

  var url = new URI("uploadAttachment.html").absoluteTo(window.location).toString();
  var dialogOptions = { width: 40, height: 60, displayInIframe: true };

  Office.context.ui.displayDialogAsync(url, dialogOptions, function (result) {
    uploadDialog = result.value;

    uploadDialog.addEventHandler(Office.EventType.DialogMessageReceived, receiveMessage);
    uploadDialog.addEventHandler(Office.EventType.DialogEventReceived, dialogClosed);
  });
}

function loadAttachPage(event) {
  attachEvent = event;

  var url = new URI("downLoadfile.html").absoluteTo(window.location).toString();
  var dialogOptions = { width: 40, height: 60, displayInIframe: true };

  Office.context.ui.displayDialogAsync(url, dialogOptions, function (result) {
    attachDialog = result.value;

    attachDialog.addEventHandler(Office.EventType.DialogMessageReceived, receiveMessage);
    attachDialog.addEventHandler(Office.EventType.DialogEventReceived, dialogClosed);
  });
}

// Adds text into the body of the item, then reports the results
// to the info bar.
function addTextToBody(text, icon, event) {
  Office.context.mailbox.item.body.setSelectedDataAsync(
    text,
    { coercionType: Office.CoercionType.Text },
    function (asyncResult) {
      if (asyncResult.status == Office.AsyncResultStatus.Succeeded) {
        statusUpdate(icon, '"' + text + '" inserted successfully.');
      } else {
        Office.context.mailbox.item.notificationMessages.addAsync("addTextError", {
          type: "errorMessage",
          message: 'Failed to insert "' + text + '": ' + asyncResult.error.message,
        });
      }
      if (event) event.completed();
    }
  );
}

function statusUpdate(icon, text) {
  Office.context.mailbox.item.notificationMessages.replaceAsync("status", {
    type: "informationalMessage",
    icon: icon,
    message: text,
    persistent: false,
  });
}

function receiveMessage(message) {
  message = JSON.parse(message.message);
  if (message && message.seafile_env) {
    setConfig(message, function (result) {
      loginDialog.close();
      loginDialog = null;
      loginEvent.completed();
      loginEvent = null;
    });
  } else if (message && message.downloadLink) {
    addTextToBody(message.downloadLink, "attach-icon-16");
  } else {
    if (uploadDialog) {
      uploadDialog.close();
      uploadDialog = null;
      uploadEvent.completed();
      uploadEvent = null;
    }
    if (attachDialog) {
      attachDialog.close();
      attachDialog = null;
      attachEvent.completed();
      attachEvent = null;
    }
    if (settingsDialog) {
      settingsEvent.completed();
      settingsEvent = null;
      settingsDialog.close();
      settingsDialog = null;
    }
  }
}

function loadSettingsPage(event) {
  settingsEvent = event;

  var url = new URI("settings.html").absoluteTo(window.location).toString();
  var dialogOptions = { width: 40, height: 60, displayInIframe: true };

  Office.context.ui.displayDialogAsync(url, dialogOptions, function (result) {
    settingsDialog = result.value;

    settingsDialog.addEventHandler(Office.EventType.DialogMessageReceived, receiveMessage);
    settingsDialog.addEventHandler(Office.EventType.DialogEventReceived, dialogClosed);
  });
}

function settingsPage(event) {
  config = getConfig();
  if (config && config.seafile_env) {
    loadSettingsPage(event);
  } else {
    login(event);
  }
}

function dialogClosed(event) {
  if (loginDialog) {
    loginEvent.completed();
    loginEvent = null;
    loginDialog.close();
    loginDialog = null;
  }
  if (uploadDialog) {
    uploadEvent.completed();
    uploadEvent = null;
    uploadDialog.close();
    uploadDialog = null;
  }
  if (attachDialog) {
    attachEvent.completed();
    attachEvent = null;
    attachDialog.close();
    attachDialog = null;
  }
  if (settingsDialog) {
    settingsEvent.completed();
    settingsEvent = null;
    settingsDialog.close();
    settingsDialog = null;
  }
}

function getGlobal() {
  return typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;
}

var g = getGlobal();

// The add-in command functions need to be available in global scope
g.uploadattachment = uploadattachment;
g.Attach = Attach;
g.login = login;
g.settingsPage = settingsPage;
