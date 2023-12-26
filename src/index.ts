import path from "path";
import { ReadableStream } from "web-streams-polyfill";
// @ts-ignore
global.ReadableStream = ReadableStream;

import {
  isFileExist,
  readAllVideos,
  readTextFile,
  writeTextFile,
} from "./utils/fs-utils";
import { convertToSound } from "./utils/ffmpeg-utils";
import { storeTranscript } from "./utils/ai-utils";
import { summaryChain } from "./chains/summary_chain";

const videosRoot = path.join(__dirname, "../videos");

async function main() {
  // 1. Reading a list of videos
  console.log("Reading a list of videos");
  const allVideos = readAllVideos();

  for (let i = 0; i < allVideos.length; i++) {
    const videoPath = path.join(videosRoot, allVideos[i]);

    const soundOutputFileName = path.join(
      videosRoot,
      allVideos[i].split(".")[0] + ".mp3"
    );

    // 2. Convert each video to audio
    if (isFileExist(soundOutputFileName)) {
      console.log("Converting video to audio", soundOutputFileName);
      await convertToSound(videoPath, soundOutputFileName);
    }

    const transcriptFileName = path.join(
      videosRoot,
      allVideos[i].split(".")[0] + ".srt"
    );

    // 3. Get transcript for each audio
    if (!isFileExist(transcriptFileName)) {
      console.log("Getting transcript for audio", soundOutputFileName);
      await storeTranscript(soundOutputFileName, transcriptFileName, "fa");
    }

    // 5. Ask AI to generate a summary all transcripts and return it as a text file, and keeping the time data.
    const transcript = readTextFile(transcriptFileName);
    console.log("Getting transcript summary for", transcriptFileName);
    await summaryChain.invoke({ transcript }).then((summary) => {
      const summaryFileName = path.join(
        videosRoot,
        allVideos[i].split(".")[0] + ".summary.srt"
      );

      writeTextFile(summaryFileName, summary.text);
    });
  }

  // 6. Cutout videos based on the summary time data and combine them.
  // -- ffmpeg
}

main();
