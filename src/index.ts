import path from "path";
import { ReadableStream } from "web-streams-polyfill";
// @ts-ignore
global.ReadableStream = ReadableStream;

import {
  createFolder,
  isFileExist,
  readAllVideos,
  readTextFile,
  writeTextFile,
} from "./utils/fs-utils";
import { convertToSound, cutVideo, mergeVideos } from "./utils/ffmpeg-utils";
import { storeTranscript } from "./utils/ai-utils";
import { summaryChain } from "./chains/summary_chain";
import { gettimeCutsFromTranscript } from "./utils/transcript.util";

const videosRoot = path.join(
  "/Users/navid-shad/Youtube_project/Making of Ai video editor"
);

const tempRoot = path.join(__dirname, "../tmp");
createFolder(tempRoot);

async function main() {
  //
  // 1. Reading a list of videos
  //
  console.log("Reading a list of videos");
  const allVideos = readAllVideos(videosRoot);

  for (let i = 0; i < allVideos.length; i++) {
    const videoName = path.basename(allVideos[i].split(".")[0]);
    const videoPath = path.join(videosRoot, allVideos[i]);

    const soundOutputFileName = path.join(
      tempRoot,
      allVideos[i].split(".")[0] + ".mp3"
    );

    //
    // 2. Convert each video to audio
    //
    if (!isFileExist(soundOutputFileName)) {
      console.log("Converting video to audio", soundOutputFileName);
      await convertToSound(videoPath, soundOutputFileName);
    }

    const transcriptFileName = path.join(
      tempRoot,
      allVideos[i].split(".")[0] + ".srt"
    );

    //
    // 3. Get transcript for each audio
    //
    if (!isFileExist(transcriptFileName)) {
      console.log("Getting transcript for audio", soundOutputFileName);
      await storeTranscript(soundOutputFileName, transcriptFileName, "fa");
    }

    //
    // 4. Ask AI to generate a summary all transcripts and return it as a text file, and keeping the time data.
    //
    const transcript = readTextFile(transcriptFileName).split("\n ").join("");

    const summaryFileName = path.join(
      tempRoot,
      allVideos[i].split(".")[0] + ".summary.srt"
    );

    if (!isFileExist(summaryFileName)) {
      console.log("Getting transcript summary for", transcriptFileName);
      const userExpectation = readTextFile("./prompt/user-expectation.txt");
      await summaryChain
        .invoke({ transcript, userExpectation })
        .then((summary) => {
          writeTextFile(summaryFileName, summary.text);
        });
    }

    // 5. cute out the video based on the summary time data.
    // -- ffmpeg
    const timeCuts = gettimeCutsFromTranscript(readTextFile(summaryFileName));

    // 6. Cutout videos based on the summary time data
    for (let timeIndex = 0; timeIndex < timeCuts.length; timeIndex++) {
      const timeCute = timeCuts[timeIndex];

      const cutDirectory = path.join(tempRoot, videoName);
      createFolder(cutDirectory);

      const cutFileName = path.join(
        cutDirectory,
        `${videoName}-${timeIndex}.mp4`
      );

      if (!isFileExist(cutFileName)) {
        console.log("Cut video", videoName, timeCute);
        await cutVideo(videoPath, cutFileName, timeCute.start, timeCute.end);
      }
    }

    // 7. Merge all cut videos
    const cutVideos = readAllVideos(path.join(tempRoot, videoName)).map(
      (video) => path.join(tempRoot, videoName, video)
    );

    const mergePath = path.join(tempRoot, videoName + "_short.mp4");

    if (!isFileExist(mergePath)) {
      console.log("Merging videos", cutVideos);
      await mergeVideos(cutVideos, mergePath);
    }
  }

  //  and combine them.
  // -- ffmpeg
}

main();
