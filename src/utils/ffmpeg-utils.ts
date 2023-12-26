import ffmpeg from "fluent-ffmpeg";

export function convertToSound(videoPath: string, output: string) {
  return new Promise((done, reject) => {
    ffmpeg(videoPath)
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
