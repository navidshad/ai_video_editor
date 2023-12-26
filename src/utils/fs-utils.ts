import fs from "fs";

export function readAllVideos() {
  const videos = fs.readdirSync("./videos");
  const extensions = ["mp4", "mkv"];
  return videos.filter((video) => extensions.includes(video.split(".")[1]));
}

export function readTextFile(path: string) {
  return fs.readFileSync(path, { encoding: "utf-8" });
}

export function writeTextFile(path: string, content: string) {
  fs.writeFileSync(path, content);
}

export function isFileExist(path: string) {
  return fs.existsSync(path);
}
