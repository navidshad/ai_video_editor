import fs from "fs";
import path from "path";
import { readAllVideos } from "./fs-utils";
import { convertToSound } from "./ffmpeg-utils";
import { getTranscript } from "./ai-utils";
import { sleep } from "./promise-utils";

const videosRoot = path.join(__dirname, "../videos");

async function main() {
  // 1. Reading a list of videos
  const allVideos = readAllVideos();

  // 2. Convert each video to audio
  for (let i = 0; i < allVideos.length; i++) {
    const videoPath = path.join(videosRoot, allVideos[i]);

    const soundOutputFileName = path.join(
      videosRoot,
      allVideos[i].split(".")[0] + ".mp3"
    );

    await convertToSound(videoPath, soundOutputFileName);
    await await sleep(200);

    const transcriptFileName = path.join(
      videosRoot,
      allVideos[i].split(".")[0] + ".srt"
    );

    // 3. Get transcript for each audio
    await getTranscript(soundOutputFileName, transcriptFileName, "fa");
  }

  // 5. Combine all transcripts and shifting time data.
  // 6. Ask AI to generate a summary all transcripts and return it as a text file, and keeping the time data.
  // 7. Cutout videos based on the summary time data and combine them.
  // -- ffmpeg
}

main();
