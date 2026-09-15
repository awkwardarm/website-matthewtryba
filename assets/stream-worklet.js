/**
 * Jitter buffer + playback for TRYBA Stream.
 *
 * Decoded AudioData arrives on the main thread and is posted here as plain Float32
 * channel data. This processor holds a ring buffer and drains it one render quantum at a
 * time, which is what turns a bursty network feed into continuous sound.
 *
 * See docs/PROTOCOL.md in the tryba-stream repo.
 */
class StreamPlayer extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const { targetFrames, channels } = options.processorOptions;
    this.channels = channels;
    this.target = targetFrames;
    // Beyond 2x target the listener has drifted behind; drop rather than let latency grow.
    this.max = targetFrames * 2;

    this.queue = []; // [{ data: Float32Array[], offset }]
    this.queued = 0; // frames currently buffered
    this.priming = true; // silent until the buffer first reaches target
    this.starved = 0;
    this.played = 0;
    this.lastReport = 0;

    // Meter peaks over exactly the samples being played, so the meters show what is
    // coming out of the jitter buffer rather than what arrived from the network.
    // Posted about 30 times a second; the page smooths between updates.
    this.meterPeak = [0, 0];
    this.meterFrames = 0;
    this.meterInterval = Math.round(sampleRate / 30);

    this.port.onmessage = (e) => {
      const m = e.data;
      if (m.type === "audio") {
        this.queue.push({ data: m.channels, offset: 0 });
        this.queued += m.channels[0].length;
        this.trim();
      } else if (m.type === "reset") {
        this.queue = [];
        this.queued = 0;
        this.priming = true;
      } else if (m.type === "target") {
        this.target = m.targetFrames;
        this.max = m.targetFrames * 2;
      }
    };
  }

  /**
   * Drop the oldest audio when the buffer runs long. Dropping old rather than new keeps
   * the listener near live; it is a re-sync, and because whole frames go at once it is
   * not a pitch or rate change.
   */
  trim() {
    while (this.queued > this.max && this.queue.length > 1) {
      const head = this.queue.shift();
      this.queued -= head.data[0].length - head.offset;
    }
  }

  process(_inputs, outputs) {
    const out = outputs[0];
    const need = out[0].length;

    // Hold silence until the buffer has filled to target, then run continuously.
    if (this.priming) {
      if (this.queued < this.target) {
        this.report(true);
        return true;
      }
      this.priming = false;
    }

    let written = 0;
    while (written < need && this.queue.length > 0) {
      const head = this.queue[0];
      const avail = head.data[0].length - head.offset;
      const take = Math.min(avail, need - written);

      for (let ch = 0; ch < out.length; ch++) {
        const src = head.data[Math.min(ch, head.data.length - 1)];
        out[ch].set(src.subarray(head.offset, head.offset + take), written);
      }

      head.offset += take;
      written += take;
      this.queued -= take;
      if (head.offset >= head.data[0].length) this.queue.shift();
    }

    if (written < need) {
      // Under-run: the rest of this quantum is silence and we rebuild to target before
      // resuming, rather than stuttering through every following quantum.
      this.starved++;
      this.priming = true;
    }
    this.played += written;
    this.measure(out, written, need);
    this.report(false);
    return true;
  }

  measure(out, written, need) {
    for (let ch = 0; ch < out.length && ch < 2; ch++) {
      const d = out[ch];
      let p = this.meterPeak[ch];
      for (let i = 0; i < written; i++) {
        const a = d[i] < 0 ? -d[i] : d[i];
        if (a > p) p = a;
      }
      this.meterPeak[ch] = p;
    }
    if (out.length === 1) this.meterPeak[1] = this.meterPeak[0];   // mono feeds both

    this.meterFrames += need;
    if (this.meterFrames >= this.meterInterval) {
      this.port.postMessage({ type: "meter", l: this.meterPeak[0], r: this.meterPeak[1] });
      this.meterPeak[0] = 0;
      this.meterPeak[1] = 0;
      this.meterFrames = 0;
    }
  }

  report(silent) {
    const now = currentTime;
    if (now - this.lastReport < 0.5) return;
    this.lastReport = now;
    this.port.postMessage({
      type: "stats",
      bufferedFrames: this.queued,
      target: this.target,
      starved: this.starved,
      silent,
    });
  }
}

registerProcessor("stream-player", StreamPlayer);
