import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getTranscript(
  soundFilePath: string,
  outputFilePath: string,
  language: string
) {
  // read audio file and get openai transcript
  const audio = fs.createReadStream(soundFilePath);

  return openai.audio.transcriptions
    .create({
      file: audio,
      model: "whisper-1",
      language: language || "fa",
      response_format: "srt",
    })
    .then((transcript) => {
      // write transcript to file
      fs.writeFile(outputFilePath, transcript as any, (err) => {
        if (err) throw err;
        console.log("The file has been saved!");
      });
    });
}
