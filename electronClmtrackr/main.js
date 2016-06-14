'use strict';

const electron = require('electron');
const app = electron.app;  // Modul za nadzor žibljenskega cikla aplikacije.
const BrowserWindow = electron.BrowserWindow;  // Modul za brskalniško okno.

// Globalno referenco potrebujemo, sicer se okno samodejno zapre, ko JS
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Izhod, ko zapreo vsa okna
app.on('window-all-closed', function() {
  // Na sistemu OS je običajno, da se zapremo apliakcijo s tipkama Cmd + Q
  //if (process.platform != 'darwin') {
    app.quit();
  //}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // ustvarimo okno brskalnika
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // naložimo index.html in aplikacijo
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Orodja DevTools so uporabna za razvoj
  // mainWindow.webContents.openDevTools();

  // Dogodek se sproži ob zepiranju okna.
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
