import ffmpeg from "fluent-ffmpeg";
import { createFolder } from "./fs-utils";

export function convertToSound(videoPath: string, output: string) {
  return new Promise((done, reject) => {
    ffmpeg(videoPath)
      .audioChannels(1)
      .audioBitrate(64) // Decrease bitrate for lower quality
      .audioFrequency(11025) // Decrease frequency for lower quality
      .output(output)
      .on("end", function () {
        done("done");
        console.log("Finished processing");
      })
      .on("error", function (err) {
        reject(err);
        console.error(err);
      })
      .run();
  });
}

export function cutVideo(
  videoPath: string,
  output: string,
  start: number,
  end: number
) {
  return new Promise((done, reject) => {
    ffmpeg(videoPath)
      .output(output)
      .setStartTime(start)
      .setDuration(end - start)
      .on("end", function () {
        done("done");
        console.log("Finished processing");
      })
      .on("error", function (err) {
        reject(err);
        console.error(err);
      })
      .run();
  });
}

export function mergeVideos(
  videoPaths: string[],
  output: string,
  audio: boolean = true
) {
  return new Promise((done, reject) => {
    const command = ffmpeg();

    for (let i = 0; i < videoPaths.length; i++) {
      command.addInput(videoPaths[i]);
    }

    if (audio) {
      command.audioCodec("aac");
    }

    createFolder("./tmp");

    command
      .on("end", function () {
        done("done");
        console.log("Finished processing");
      })
      .on("error", function (err, stdout, stderr) {
        console.error("Error:", err);
        console.error("ffmpeg stdout:", stdout);
        console.error("ffmpeg stderr:", stderr);
        reject(err);
      })
      .mergeToFile(output, "./tmp");
  });
}
