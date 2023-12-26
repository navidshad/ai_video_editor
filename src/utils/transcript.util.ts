export function gettimeCutsFromTranscript(transcript: string) {
  const timeCuts: Array<{ start: number; end: number }> = [];
  const lines = transcript.split("\n").filter((line) => line.includes("-->"));

  function addTimeCute(start: number, end: number) {
    const extensionIndex = timeCuts.findIndex(
      (timeCute) => timeCute.end === start
    );

    if (extensionIndex !== -1) {
      timeCuts[extensionIndex].end = end;
      return;
    } else {
      timeCuts.push({ start, end });
    }
  }

  for (const line of lines) {
    // 00:00:00,000 --> 00:00:00,000
    const [startTime, endTime] = line.split(" --> ");
    const [startHours, startMinutes, startSeconds] = startTime.split(":");
    const [endHours, endMinutes, endSeconds] = endTime.split(":");

    const start =
      parseInt(startHours) * 3600 +
      parseInt(startMinutes) * 60 +
      parseInt(startSeconds);

    const end =
      parseInt(endHours) * 3600 +
      parseInt(endMinutes) * 60 +
      parseInt(endSeconds);

    addTimeCute(start, end);
  }

  return timeCuts;
}
