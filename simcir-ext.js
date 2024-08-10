"use strict";

const REPLACE = [
  ['"devices":[', '@D'],
  ['],"connectors":[', '@C'],
  ['{"type":', '%P'],
  [',"color":', '%C'],
  [',"id":', '%I'],
  [',"x":', '%X'],
  [',"y":', '%Y'],
  [',"label":', '%L'],
  [',"state":', '%S'],
  ['"on":', '%O'],
  ['{"from":', '%F'],
  [',"to":', '%2'],
  ['"dev', '%D'],
  ['true', '#T'],
  ['false', '#F'],
  ['"#ff0000"', '#C'],
  ['"DC"', '$D'],
  ['"Toggle"', '$T'],
  ['"LED"', '$L'],
  ['"AND"', '$A'],
  ['"OR"', '$O'],
  ['"NOT"', '$N'],
  ['"NAND"', '$M'],
  ['"XOR"', '$X'],
  ['"4bit7seg"', '$4']
]

function simcirExtEncode(str) {
  let s = str.replace(/\.in(\d+)"/g, "@$1").replace(/\.out(\d+)"/g, "#$1")
  for (const fromto of REPLACE) s = s.replaceAll(fromto[0], fromto[1])

  const uint8arr = new TextEncoder().encode(s)
  const binStr = Array.from(uint8arr).map(b => String.fromCharCode(b)).join("")
  return btoa(binStr).replaceAll("+", "_").replaceAll("/", "-").replaceAll("=", ".")
}

function simcirExtDecode(str) {
  const binStr = atob(str.replaceAll("_", "+").replaceAll("-", "/").replaceAll(".", "="))
  const uint8arr = binStr.split("").map(b => b.charCodeAt(0))
  let s = new TextDecoder().decode(Uint8Array.from(uint8arr))

  for (const fromto of REPLACE) s = s.replaceAll(fromto[1], fromto[0])
  return s.replace(/\@(\d+)/g, '.in$1"').replace(/\#(\d+)/g, '.out$1"')
}


function getData() {
  const text = simcir.controller(document.getElementsByClassName("simcir-workspace")).text()
  return simcirExtEncode("{" + text.match(/"devices".+$/s)[0].replaceAll(/\s+/g, ""))
}

function setData(data) {
  const json = JSON.parse(simcirExtDecode(data))
  let simcir_data = {
    "width":640,
    "height":420,
    "showToolbox":true,
    "toolbox":[
      {"type":"DC"},
      {"type":"Toggle"},
      {"type":"LED","color":"#ff0000","label":"LED"},
      {"type":"AND","label":"AND"},
      {"type":"OR","label":"OR"},
      {"type":"NOT","label":"NOT"},
      {"type":"NAND","label":"NAND"},
      {"type":"XOR","label":"XOR"},
      {"type":"4bit7seg","color":"#ff0000"}
    ],
    "devices":[],
    "connectors":[]
  }
  if (json.devices) simcir_data.devices = json.devices
  if (json.connectors) simcir_data.connectors = json.connectors
  simcir.setupSimcir(document.getElementsByClassName("simcir"), simcir_data )
}

function urlCopy() {
  location.hash = getData();
  navigator.clipboard.writeText(location.href);
}

window.addEventListener("load", function() {
  if (location.href.indexOf("#") != -1) setData(location.hash.replace("#", ""))
})
