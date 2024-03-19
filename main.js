"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ProgressBar = require("progress");
var exec = require("child_process").exec;
var fs = require("fs");
var path = require("path");
var CreateJLinkFiles_1 = require("./tools/CreateJLinkFiles");
var done = false;
var err = false;
var jLinkPath = path.join(__dirname, "ref/JLinkPath.txt");
if (!fs.existsSync(jLinkPath)) {
    console.error("Please Create a file named JLinkPath.txt in the ref folder and type in the path to JLinkExe");
    process.exit(1);
}
var jLinkExePath = fs.readFileSync(jLinkPath, "utf8");
if (!fs.existsSync(jLinkExePath)) {
    console.error("The path to JLinkExe is invalid. Please check the path in ref/JLinkPath.txt");
    process.exit(1);
}
var colorArray = [
    "\x1b[41m  \x1b[0m",
    "\x1b[43m  \x1b[0m",
    "\x1b[42m  \x1b[0m",
    "\x1b[46m  \x1b[0m",
    "\x1b[45m  \x1b[0m",
    "\x1b[44m  \x1b[0m",
];
var colorString = "";
var TOTAL = 6;
function runCmd(cmd) {
    err = false;
    var status = 0;
    console.log("Running \"".concat(cmd, "\""));
    var child = exec(cmd);
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", function (data) {
        if (data.indexOf("FAILED: Cannot connect to J-Link.") != -1 ||
            data.indexOf("Target voltage too low.") != -1 ||
            data.indexOf("Cannot connect to target.") != -1) {
            console.error("J-Link not connected. Please connect J-Link and try again.");
            err = true;
            child.kill();
        }
        else if (data.indexOf("Erasing device...") != -1 || status == 1) {
            status = 1;
            if (data.indexOf("Erasing device...") != -1) {
                data = data.split("Erasing device...")[1];
            }
            var bar = new ProgressBar("Erasing device... [:bar] :percent", {
                complete: "=",
                incomplete: " ",
                width: 20,
                total: 100,
            });
            if (data.indexOf("Failed to erase sectors") != -1) {
                bar.terminate();
                console.error("\nErase failed. Please try again.");
                err = true;
                child.kill();
            }
            if (data.indexOf("%]") != -1) {
                var progress = data.split("%]")[0].slice(-3);
                bar.tick(progress);
            }
            if (bar.complete) {
                status = 0;
            }
        }
        else if (data.indexOf("Programming flash") != -1 || status == 2) {
            status = 2;
            if (data.indexOf("Programming flash") != -1) {
                data = data.split("Programming flash")[1];
            }
            var bar = new ProgressBar("Flashing file...  [:bar] :percent", {
                complete: "=",
                incomplete: " ",
                width: 20,
                total: 100,
            });
            if (data.indexOf("Programming failed") != -1) {
                bar.terminate();
                console.error("\nFlashing failed. Please try again.");
                err = true;
                child.kill();
            }
            if (data.indexOf("%]") != -1) {
                var progress = data.split("%]")[0].slice(-3);
                bar.tick(progress);
            }
            if (bar.complete) {
                status = 0;
            }
        }
        else if (data.indexOf("Error:") != -1) {
            console.error("Error: " + data.split("Error:")[1].split("\n")[0]);
            err = true;
            child.kill();
            data = "";
        }
        else {
        }
    });
    child.on("close", function (code) {
        if (!err) {
            done = true;
            console.log("Running command \"".concat(cmd, "\" completed."));
            console.log("Command executed successfully.");
            process.stdout.write("Press enter to continue...");
        }
    });
}
(0, CreateJLinkFiles_1.CreateJLinkFiles)();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var i, cmd;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    i = 1;
                    _a.label = 1;
                case 1:
                    if (!(i <= TOTAL)) return [3, 6];
                    done = false;
                    console.log("\x1b[2J");
                    if (colorString.length < i * colorArray[0].length) {
                        colorString += "[" + colorArray[i - 1] + "]";
                    }
                    console.log(i + " of " + TOTAL + " " + colorString);
                    cmd = "".concat(jLinkExePath, " -CommandFile jlink/CubeProbe_bl_").concat(i, ".jlink -ExitOnError 1 -NoGui 1");
                    runCmd(cmd);
                    _a.label = 2;
                case 2:
                    if (!!done) return [3, 4];
                    return [4, new Promise(function (resolve) {
                            process.stdin.once("data", function () {
                                if (done) {
                                    console.log("Continuing...");
                                }
                                resolve(0);
                            });
                        })];
                case 3:
                    _a.sent();
                    return [3, 2];
                case 4:
                    if (err) {
                        i -= 1;
                        return [3, 5];
                    }
                    _a.label = 5;
                case 5:
                    i++;
                    return [3, 1];
                case 6:
                    console.log("All commands executed successfully.");
                    process.exit(0);
                    return [2, 0];
            }
        });
    });
}
main();
