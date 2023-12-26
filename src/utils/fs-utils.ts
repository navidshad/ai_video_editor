import fs from "fs";

export function readAllVideos() {
  const videos = fs.readdirSync("./videos");
  const extensions = ["mp4", "mkv"];
  return videos.filter((video) => extensions.includes(video.split(".")[1]));
}
