const ProgressBar = require("progress");
const exec = require("child_process").exec;
const fs = require("fs");
const path = require("path");
import { CreateJLinkFiles } from "./tools/CreateJLinkFiles";
var done: boolean = false;
var err: boolean = false;

// check if data/JLinkPath.txt exists
const jLinkPath = path.join(__dirname, "ref/JLinkPath.txt");
if (!fs.existsSync(jLinkPath)) {
  console.error(
    "Please Create a file named JLinkPath.txt in the ref folder and type in the path to JLinkExe"
  );
  process.exit(1);
}
const jLinkExePath = fs.readFileSync(jLinkPath, "utf8");
if (!fs.existsSync(jLinkExePath)) {
  console.error(
    "The path to JLinkExe is invalid. Please check the path in ref/JLinkPath.txt"
  );
  process.exit(1);
}

var colorArray: string[] = [
  "\x1b[41m  \x1b[0m", // Red
  "\x1b[43m  \x1b[0m", // Yellow
  "\x1b[42m  \x1b[0m", // Green
  "\x1b[46m  \x1b[0m", // Cyan
  "\x1b[45m  \x1b[0m", // Purple
  "\x1b[44m  \x1b[0m", // Blue
];
var colorString: string = "";
const TOTAL: number = 6;

function runCmd(cmd: string) {
  err = false;
  let status = 0;
  console.log(`Running "${cmd}"`);
  var child = exec(cmd);
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", function (data: string) {
    if (
      data.indexOf("FAILED: Cannot connect to J-Link.") != -1 ||
      data.indexOf("Target voltage too low.") != -1 ||
      data.indexOf("Cannot connect to target.") != -1
    ) {
      console.error(
        "J-Link not connected. Please connect J-Link and try again."
      );
      err = true;
      child.kill();
    } else if (data.indexOf("Erasing device...") != -1 || status == 1) {
      status = 1;
      if (data.indexOf("Erasing device...") != -1) {
        data = data.split("Erasing device...")[1];
      }
      let bar = new ProgressBar("Erasing device... [:bar] :percent", {
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
        let progress = data.split("%]")[0].slice(-3);
        bar.tick(progress);
      }
      if (bar.complete) {
        status = 0;
      }
    } else if (data.indexOf("Programming flash") != -1 || status == 2) {
      status = 2;
      if (data.indexOf("Programming flash") != -1) {
        data = data.split("Programming flash")[1];
      }
      let bar = new ProgressBar("Flashing file...  [:bar] :percent", {
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
        let progress = data.split("%]")[0].slice(-3);
        bar.tick(progress);
      }
      if (bar.complete) {
        status = 0;
      }
    } else if (data.indexOf("Error:") != -1 && status != -1) {
      // console.log(data);
      status = -1;
      console.error("Error: " + data.split("Error:")[1].split("\n")[0]);
      err = true;
      child.kill();
      data = "";
    } else {
      // console.log(data);
    }
  });

  child.on("close", function (code: number) {
    done = true;
    if (!err) {
      console.log(`Running command "${cmd}" completed.`);
      console.log("Command executed successfully.");
      process.stdout.write("Press enter to continue...");
    }
  });
}

CreateJLinkFiles();

async function main() {
  for (let i = 1; i <= TOTAL; i++) {
    done = false;
    console.log("\x1b[2J");
    if (colorString.length < i * colorArray[0].length) {
      colorString += "[" + colorArray[i - 1] + "]";
    }
    console.log(i + " of " + TOTAL + " " + colorString);
    const cmd: string = `${jLinkExePath} -CommandFile jlink/CubeProbe_bl_${i}.jlink -ExitOnError 1 -NoGui 1`;
    runCmd(cmd);
    while (!done) {
      await new Promise((resolve) => {
        process.stdin.once("data", () => {
          if (done) {
            console.log("Continuing...");
          }
          resolve(0);
        });
      });
    }
    if (err) {
      i -= 1;
      continue;
    }
  }
  console.log("All commands executed successfully.");
  process.exit(0);
  return 0;
}

main();
