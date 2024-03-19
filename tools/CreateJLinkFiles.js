"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateJLinkFiles = void 0;
var fs = require("fs");
function CreateJLinkFiles() {
    for (var i = 1; i <= 6; i++) {
        var commands = "si swd\ndevice STM32H757ZI_M7\nspeed 4000\nerase\njtagconf -1,-1\nconnect\nloadfile bin/CubeProbe_bl_".concat(i, ".hex\nr\ng\nsleep 100\nexit");
        fs.writeFileSync("jlink/CubeProbe_bl_".concat(i, ".jlink"), commands);
    }
    console.log("JLink files created");
}
exports.CreateJLinkFiles = CreateJLinkFiles;
