/**
 * Tryba Stream listener — WebSocket → WebCodecs AudioDecoder → AudioWorklet.
 *
 * Design notes that matter (PLAN.md §4):
 *  - Playback ALWAYS starts from a tap. Autoplay was dropped deliberately: it could
 *    never be relied on (it is blocked on every phone and on a first desktop visit),
 *    it made the page claim to be playing when it was not, and the button doubles as
 *    the pause control — so the one tap teaches the control that stops the stream too.
 *  - Everything the browser gates on a user gesture happens synchronously inside the
 *    click handler. Deferring any of it until the socket connects loses gesture credit
 *    in Safari.
 *  - The socket opens and the buffer fills while the button is on screen, so a tap
 *    produces sound immediately instead of a spinner.
 */
(function () {
  "use strict";

  // Served from a dev machine, talk to the local relay. Deliberately keyed off the
  // page's own hostname rather than a query parameter, so a crafted link can never
  // point a real listener's socket at someone else's server.
  var LOCAL = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  var RELAY = window.TRYBA_STREAM_RELAY ||
    (LOCAL ? "ws://127.0.0.1:8787" : "wss://stream.matthewtryba.com");
  var CODEC = "mp4a.40.2";

  /**
   * Drawn rather than typed. A text glyph inherits the platform font, and centring it
   * needed a padding fudge for the triangle plus letter-spacing for the pause pair —
   * and letter-spacing adds trailing space after the last character, which is what
   * pushed the pause bars left of centre. SVG has none of those problems.
   *
   * The triangle's box is deliberately offset right (34–80 against a 0–100 viewBox) so
   * it reads as centred: a triangle's visual mass sits left of its bounding box, so
   * geometric centring looks wrong. The pause bars span 30–70 and are truly centred,
   * because two rectangles need no such correction.
   */
  var ICON_PLAY =
    '<svg viewBox="0 0 100 100" width="40" height="40" aria-hidden="true" focusable="false">' +
    '<polygon points="34,20 34,80 82,50" fill="currentColor"/></svg>';
  var ICON_PAUSE =
    '<svg viewBox="0 0 100 100" width="36" height="36" aria-hidden="true" focusable="false">' +
    '<rect x="30" y="22" width="15" height="56" rx="3.5" fill="currentColor"/>' +
    '<rect x="55" y="22" width="15" height="56" rx="3.5" fill="currentColor"/></svg>';
  var MsgType = { HELLO: 0x01, AUDIO: 0x02, BYE: 0x03 };

  var el = {};
  var ws = null;
  var decoder = null;
  var ctx = null;
  var node = null;
  var gain = null;
  var hello = null;
  var epoch = null;
  var started = false;
  var soundRunning = false;
  var live = false;
  // An expired link will never work again, so the page must stop trying: left open, a
  // 2-second reconnect loop would cost the relay about 43,000 requests a day per tab.
  var linkExpired = false;
  var ENDED = "This stream has ended";
  var ENDED_HINT = "If Matthew starts again, it will pick up here on its own.";
  var fullPoll = null;
  var firstAudioAt = 0;
  var touchedVolume = false;
  // ?debug=1 surfaces the worklet's buffer health on screen. The worklet has always
  // reported this; nothing displayed it, which is why "a brief beep then silence" could
  // not be told apart from starvation, a lost audio session, or a stalled decoder.
  var DEBUG = /[?&]debug=1/.test(location.search);
  var dbg = { audioMsgs: 0, decoded: 0, buffered: 0, target: 0, starved: 0, silent: false,
              lastAudioAt: 0, ctxState: "-", sessionDrops: 0, route: "destination" };
  var mediaEl = null;
  var mediaDest = null;
  var paused = false;

  // ---------------------------------------------------------------- boot

  document.addEventListener("DOMContentLoaded", function () {
    ["screen-loading","screen-unsupported","screen-full","screen-player","play-button","play-label","takeover-hint",
     "status-line","status-hint","volume","mute","help-link","help-panel","live-dot","error-note",
     "meters","meter-l","meter-r","robot-head",
     "unsupported-reason","chrome-actions"].forEach(function (id) {
      el[id.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); })] =
        document.getElementById(id);
    });

    var params = new URLSearchParams(location.search);
    var room = params.get("s");
    if (!room || !/^[0-9a-f]{32}$/.test(room)) {
      return showUnsupported("That link doesn't look complete. Ask Matthew to send it again.", false);
    }

    checkSupport().then(function (ok) {
      if (!ok) return;
      restoreVolume();
      connect(room);
      prepareForPlay();
      if (DEBUG) startDebugReadout();
    });
  });

  // ---------------------------------------------------------------- capability

  function checkSupport() {
    if (typeof AudioDecoder === "undefined" || typeof AudioContext === "undefined") {
      showUnsupported("This browser can't play the stream.", true);
      return Promise.resolve(false);
    }
    return AudioDecoder.isConfigSupported({ codec: CODEC, sampleRate: 48000, numberOfChannels: 2 })
      .then(function (r) {
        if (!r.supported) { showUnsupported("This browser can't play the stream.", true); return false; }
        return true;
      })
      .catch(function () { showUnsupported("This browser can't play the stream.", true); return false; });
  }

  function showUnsupported(reason, offerChrome) {
    show("screenUnsupported");
    if (el.unsupportedReason) el.unsupportedReason.textContent = reason;
    if (!offerChrome || !el.chromeActions) return;

    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) {
      var a = document.createElement("a");
      a.className = "stream-btn";
      a.href = "googlechromes://" + location.host + location.pathname + location.search;
      a.textContent = "Open in Chrome";
      el.chromeActions.appendChild(a);
      var p = document.createElement("p");
      p.className = "stream-hint";
      p.textContent = "No Chrome? Updating your iPhone to iOS 26 also fixes this.";
      el.chromeActions.appendChild(p);
    } else {
      var b = document.createElement("button");
      b.className = "stream-btn";
      b.textContent = "Copy link";
      b.addEventListener("click", function () {
        navigator.clipboard.writeText(location.href).then(function () {
          b.textContent = "Copied — now paste it into Chrome";
        });
      });
      el.chromeActions.appendChild(b);
    }
  }

  // ---------------------------------------------------------------- transport

  function connect(room) {
    var lid = localStorage.getItem("trybaStreamLid");
    if (!lid) {
      lid = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      localStorage.setItem("trybaStreamLid", lid);
    }

    ws = new WebSocket(RELAY + "/v1/rooms/" + room + "/listen?lid=" + lid);
    ws.binaryType = "arraybuffer";

    ws.addEventListener("open", function () {
      // Honest default: nothing is playing until a HELLO proves otherwise. The relay's state
      // message follows immediately and says whether the stream has ended or not started.
      show("screenPlayer");
      setStatus("Connecting…");
      setHint("");
      hidePlayButton();
    });

    ws.addEventListener("message", function (e) {
      if (typeof e.data === "string") return handleText(e.data, room);
      handleBinary(e.data);
    });

    ws.addEventListener("close", function (e) {
      if (e.code === 4001) return;            // FULL: handled by polling /full instead
      if (e.code === 4005 || linkExpired) return;   // EXPIRED: never coming back
      setTimeout(function () { connect(room); }, 2000);
    });
  }

  function handleText(raw, room) {
    var m;
    try { m = JSON.parse(raw); } catch (_) { return; }

    if (m.t === "expired") {
      linkExpired = true;
      stopMeters();
      stopRobot();
      show("screenUnsupported");
      if (el.unsupportedReason) el.unsupportedReason.textContent = "This link is no longer active";
      var hint = document.querySelector("#screen-unsupported .stream-hint");
      if (hint) hint.textContent = "Ask Matthew for a new link. Each session gets its own.";
      var actions = el.chromeActions; if (actions) actions.innerHTML = "";
      if (ws) { try { ws.close(1000, "expired"); } catch (_) {} }
      return;
    }
    if (m.t === "state") {
      live = !!m.live;
      if (!live) {
        if (m.ended) goOffAir(ENDED, ENDED_HINT);
        else goOffAir("Waiting for Matthew to start", "");
      }
      return;
    }
    if (m.t !== "full") return;
    show("screenFull");
    if (fullPoll) return;
    // Re-check for a free slot rather than making them refresh.
    fullPoll = setInterval(function () {
      fetch(RELAY.replace(/^ws/, "http") + "/v1/rooms/" + room + "/full")
        .then(function (r) { return r.json(); })
        .then(function (s) {
          if (s.listeners < s.maxListeners) { clearInterval(fullPoll); fullPoll = null; location.reload(); }
        })
        .catch(function () {});
    }, 10000);
  }

  function handleBinary(buf) {
    var v = new DataView(buf);
    switch (v.getUint8(0)) {
      case MsgType.HELLO:  return onHello(buf, v);
      case MsgType.AUDIO:  return onAudio(buf, v);
      case MsgType.BYE:    return onBye();
    }
  }

  function onHello(buf, v) {
    var ascLen = v.getUint16(18, true);
    var next = {
      channels: v.getUint8(3),
      sampleRate: v.getUint32(4, true),
      targetBufferMs: v.getUint32(12, true),
      epoch: v.getUint32(20, true),
      asc: new Uint8Array(buf.slice(24, 24 + ascLen)),
    };
    // A new epoch means new encoder settings; feeding fresh frames to a decoder
    // configured for the old ones produces noise, so rebuild instead.
    if (epoch !== null && next.epoch !== epoch) resetPipeline();
    epoch = next.epoch;
    hello = next;

    buildDecoder();
    if (ctx) ensureGraph();
    live = true;
    show("screenPlayer");
    setLiveStatus();
    setHint("");
    // Only now is a Play button meaningful — there is audio for it to start. After the
    // first tap, the toggle comes back as it was left: a listener who paused while the
    // stream was off air still has a button to resume with.
    if (!hasGesture) showPlayButton();
    else setPlayState(!paused);
  }

  function buildDecoder() {
    if (decoder) { try { decoder.close(); } catch (_) {} }
    decoder = new AudioDecoder({
      output: onDecoded,
      error: function () { setError("Lost the audio stream. Reconnecting…"); },
    });
    decoder.configure({
      codec: CODEC,
      sampleRate: hello.sampleRate,
      numberOfChannels: hello.channels,
      description: hello.asc,
    });
  }

  function onAudio(buf, v) {
    if (!decoder || decoder.state !== "configured") return;
    var count = v.getUint8(1);
    var ts = Number(v.getBigUint64(8, true));
    var off = 16;
    var perFrame = (1024 / hello.sampleRate) * 1e6; // µs

    for (var i = 0; i < count; i++) {
      var len = v.getUint16(off, true);
      off += 2;
      decoder.decode(new EncodedAudioChunk({
        type: "key",  // every AAC-LC access unit is independently decodable
        timestamp: (ts / hello.sampleRate) * 1e6 + i * perFrame,
        data: new Uint8Array(buf, off, len),
      }));
      off += len;
    }
    if (!firstAudioAt) firstAudioAt = Date.now();
    dbg.audioMsgs++;
    dbg.lastAudioAt = Date.now();
  }

  function onDecoded(audioData) {
    dbg.decoded++;
    if (!node) { audioData.close(); return; }
    var chans = [];
    for (var c = 0; c < audioData.numberOfChannels; c++) {
      var f = new Float32Array(audioData.numberOfFrames);
      audioData.copyTo(f, { planeIndex: c, format: "f32-planar" });
      chans.push(f);
    }
    audioData.close();
    node.port.postMessage({ type: "audio", channels: chans }, chans.map(function (f) { return f.buffer; }));
  }

  function onBye() {
    goOffAir(ENDED, ENDED_HINT);
  }

  /**
   * No audio is coming. Tear the playback state back down so that if the stream
   * returns, the page starts cleanly rather than resuming a half-primed buffer — and
   * so no Play button is left on screen promising sound it cannot deliver.
   */
  // ---------------------------------------------------------------- meters

  /**
   * Stereo peak meters. They show the stream's level BEFORE the listener's volume and
   * mute, deliberately: meters moving with no sound means the problem is the listener's
   * volume, mute or silent switch, not the stream.
   *
   * Decibel scale from -60 to 0 dBFS, matching the plugin's own meters. Attack is
   * instant; the fall is time-based (24 dB per second) so it looks the same at any
   * display refresh rate.
   *
   * The colour gradient is fixed to the track and the unlit part is covered by a mask,
   * so blue always means quiet and red always means near clipping. Scaling a gradient
   * bar instead would squeeze the whole blue-to-red range into even a quiet signal.
   */
  var METER_FLOOR_DB = -60;
  var METER_FALL_DB_PER_SEC = 24;
  var meterPeak = [0, 0];
  var meterShownDb = [METER_FLOOR_DB, METER_FLOOR_DB];
  var meterLastT = 0;
  var meterRaf = 0;

  function drawMeters(t) {
    var dt = meterLastT ? Math.min(0.1, (t - meterLastT) / 1000) : 0;
    meterLastT = t;
    var masks = [el.meterL, el.meterR];
    for (var ch = 0; ch < 2; ch++) {
      var db = meterPeak[ch] > 0 ? 20 * Math.log10(meterPeak[ch]) : METER_FLOOR_DB;
      meterPeak[ch] = 0;
      var shown = meterShownDb[ch];
      shown = db > shown ? db : Math.max(METER_FLOOR_DB, shown - METER_FALL_DB_PER_SEC * dt);
      meterShownDb[ch] = shown;
      if (masks[ch]) {
        var norm = Math.min(1, Math.max(0, (shown - METER_FLOOR_DB) / -METER_FLOOR_DB));
        // The mask covers what is NOT lit, anchored at the loud end.
        masks[ch].style.transform = "scaleX(" + (1 - norm).toFixed(4) + ")";
      }
    }
    meterRaf = requestAnimationFrame(drawMeters);
  }

  // ---------------------------------------------------------------- listening robot

  /**
   * While the stream plays, the mark nods along for 3 seconds, then rests for the rest of
   * a 30 second cycle. The first nod is the moment playback starts.
   *
   * The motion is the same function the plugin editor uses (plugin/ui/ListeningMotion.h in
   * the tryba-stream repo): a side-to-side tilt at 72 BPM with a small dip on each beat,
   * and short straight black lines bursting out of each ear cup, anime style. Coordinates
   * are favicon.svg units.
   */
  var ROBOT_LOOP_MS = 3000, ROBOT_EVERY_MS = 30000;
  var robotInterval = 0, robotRaf = 0, robotLines = null;
  var LINE_ANGLES = [0, -35, 35], LINE_START = 12, LINE_TRAVEL = 4, LINE_LENGTH = 7;
  var CUP_LEFT_X = 21, CUP_RIGHT_X = 79, CUP_Y = 51;
  var REDUCED_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function smoothstep(x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); }

  function robotPose(t) {
    var env = smoothstep(t / 0.35) * smoothstep((3 - t) / 0.45);
    var beat = 2 * Math.PI * 0.6 * t;               // 0.6 left-right swings per second
    var lineOpacity = [], lineInner = [];
    for (var k = 0; k < 3; k++) {
      var p = 1.2 * t - (k === 0 ? 0 : 0.12);       // two bursts per swing; angled pair just after
      p -= Math.floor(p);
      var s = Math.sin(Math.PI * p);
      lineOpacity.push(s * s * env);
      lineInner.push(LINE_START + LINE_TRAVEL * p); // shoots outward as it flashes
    }
    return { angle: 8 * Math.sin(beat) * env, dip: 1.6 * (1 - Math.cos(2 * beat)) / 2 * env,
             lineOpacity: lineOpacity, lineInner: lineInner };
  }

  function drawRobot(t) {
    if (!el.robotHead) return;
    var pose = robotPose(t);
    el.robotHead.setAttribute("transform",
      "rotate(" + pose.angle.toFixed(3) + " 50 72) translate(0 " + pose.dip.toFixed(3) + ")");
    if (!robotLines) robotLines = el.robotHead.querySelectorAll("[data-line]");
    for (var i = 0; i < robotLines.length; i++) {
      var ln = robotLines[i], k = Number(ln.getAttribute("data-line"));
      var left = ln.getAttribute("data-side") === "left";
      var a = LINE_ANGLES[k] * Math.PI / 180, r = pose.lineInner[k];
      var dx = (left ? -1 : 1) * Math.cos(a), dy = Math.sin(a), cx = left ? CUP_LEFT_X : CUP_RIGHT_X;
      ln.setAttribute("x1", (cx + dx * r).toFixed(2));
      ln.setAttribute("y1", (CUP_Y + dy * r).toFixed(2));
      ln.setAttribute("x2", (cx + dx * (r + LINE_LENGTH)).toFixed(2));
      ln.setAttribute("y2", (CUP_Y + dy * (r + LINE_LENGTH)).toFixed(2));
      ln.setAttribute("opacity", pose.lineOpacity[k].toFixed(3));
    }
  }

  function nodOnce() {
    if (robotRaf || REDUCED_MOTION || !el.robotHead) return;
    var t0 = performance.now();
    robotRaf = requestAnimationFrame(function frame(now) {
      var t = (now - t0) / 1000;
      if (t >= ROBOT_LOOP_MS / 1000) { robotRaf = 0; drawRobot(0); return; }
      drawRobot(t);
      robotRaf = requestAnimationFrame(frame);
    });
  }

  function startRobot() {
    if (robotInterval) return;
    nodOnce();
    robotInterval = setInterval(nodOnce, ROBOT_EVERY_MS);
  }

  function stopRobot() {
    clearInterval(robotInterval);
    robotInterval = 0;
    if (robotRaf) cancelAnimationFrame(robotRaf);
    robotRaf = 0;
    drawRobot(0);
  }

  function startMeters() {
    if (!el.meters) return;
    el.meters.hidden = false;
    if (!meterRaf) { meterLastT = 0; meterRaf = requestAnimationFrame(drawMeters); }
  }

  function stopMeters() {
    if (meterRaf) cancelAnimationFrame(meterRaf);
    meterRaf = 0;
    meterPeak = [0, 0];
    meterShownDb = [METER_FLOOR_DB, METER_FLOOR_DB];
    [el.meterL, el.meterR].forEach(function (m) {
      if (m) m.style.transform = "scaleX(1)";   // fully covered = silent
    });
    if (el.meters) el.meters.hidden = true;
  }

  function goOffAir(message, hint) {
    stopMeters();
    stopRobot();
    live = false;
    soundRunning = false;
    started = false;
    if (el.playLabel) el.playLabel.textContent = "Tap to listen";
    hello = null;
    epoch = null;
    if (decoder) { try { decoder.close(); } catch (_) {} decoder = null; }
    if (node) node.port.postMessage({ type: "reset" });
    firstAudioAt = 0;
    show("screenPlayer");
    setStatus(message);
    setHint(hint || "");
    hidePlayButton();
    if (el.liveDot) el.liveDot.classList.remove("live");
  }

  function hidePlayButton() {
    if (el.playButton) el.playButton.hidden = true;
    if (el.playLabel) el.playLabel.hidden = true;
    if (el.takeoverHint) el.takeoverHint.hidden = true;
  }

  function resetPipeline() {
    if (node) node.port.postMessage({ type: "reset" });
    firstAudioAt = 0;
  }

  // ---------------------------------------------------------------- audio graph

  /**
   * Build the AudioContext. Called either during the autoplay attempt or synchronously
   * inside the Play click — never after an await, which would forfeit gesture credit.
   */
  function createContext() {
    if (ctx) return ctx;
    ctx = new AudioContext({ latencyHint: "playback" });
    gain = ctx.createGain();
    gain.gain.value = currentGain();
    gain.connect(ctx.destination);
    return ctx;
  }

  function ensureGraph() {
    if (node || !ctx || !hello) return Promise.resolve();
    var targetFrames = Math.round((hello.targetBufferMs / 1000) * hello.sampleRate);
    return ctx.audioWorklet.addModule("/assets/stream-worklet.js").then(function () {
      node = new AudioWorkletNode(ctx, "stream-player", {
        numberOfInputs: 0,
        outputChannelCount: [hello.channels],
        processorOptions: { targetFrames: targetFrames, channels: hello.channels },
      });
      node.port.onmessage = function (e) {
        if (e.data.type === "meter") {
          // Keep the loudest peak since the last drawn frame; drawMeters consumes it.
          if (e.data.l > meterPeak[0]) meterPeak[0] = e.data.l;
          if (e.data.r > meterPeak[1]) meterPeak[1] = e.data.r;
          return;
        }
        if (e.data.type !== "stats") return;
        dbg.buffered = e.data.bufferedFrames;
        dbg.target = e.data.target;
        dbg.starved = e.data.starved;
        dbg.silent = e.data.silent;
        if (!e.data.silent && !soundRunning) onSoundStarted();
      };
      node.connect(gain);
    });
  }

  var hasGesture = false;

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  /**
   * Touch devices and iOS need the tap for the media-channel routing; everyone now taps
   * anyway, so this only decides whether the <audio> element route is set up.
   */
  function needsGesture() {
    return isIOS() || navigator.maxTouchPoints > 0 || "ontouchstart" in window;
  }

  /**
   * Build the AudioContext up front so the tap has as little to do as possible, then
   * wait. Nothing is resumed here: sound only ever starts from the tap.
   */
  function prepareForPlay() {
    createContext();
    // Browsers that permit autoplay (desktop Chrome once a site has engagement, or an
    // embedded browser) create the context already running — which would start sound
    // the moment HELLO builds the graph, before anyone taps Play. Hold it suspended; the
    // tap is the only thing that resumes it. Harmless where it starts suspended anyway.
    if (ctx.state === "running") ctx.suspend();
  }

  function showPlayButton() {
    if (el.playButton && !el.playButton.querySelector("svg")) el.playButton.innerHTML = ICON_PLAY;
    // A Play button is a promise that tapping it produces sound. Never show one unless
    // there is a live stream behind it — but "started" alone must not suppress it,
    // since the autoplay path sets that without any proof of audibility.
    if (!el.playButton || hasGesture || !live || !hello) return;
    el.playButton.hidden = false;
    if (el.playLabel) el.playLabel.hidden = false;
    if (el.takeoverHint) el.takeoverHint.hidden = !needsGesture();
    el.playButton.addEventListener("click", onPlayTap, { once: true });
  }

  /**
   * The button is a play/pause toggle once sound is running. Previously it simply
   * disappeared after the first tap, which left a listener with no way to stop the
   * stream and no feedback that the tap had registered.
   */
  function setPlayState(playing) {
    paused = !playing;
    if (!el.playButton) return;
    el.playButton.hidden = false;
    el.playButton.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
    el.playButton.setAttribute("aria-label", playing ? "Pause the stream" : "Play the stream");
    el.playButton.classList.toggle("is-playing", playing);
    if (el.playLabel) el.playLabel.hidden = true;
    if (el.takeoverHint) el.takeoverHint.hidden = true;
  }

  function onPauseTap() {
    if (paused) {
      if (ctx) ctx.resume();
      if (mediaEl) { var p = mediaEl.play(); if (p && p.catch) p.catch(function () {}); }
      if (node) node.port.postMessage({ type: "reset" }); // rebuild the buffer, do not replay stale audio
      setPlayState(true);
      setLiveStatus();
      if (soundRunning) startRobot();
      if (el.liveDot) el.liveDot.classList.add("live");
    } else {
      if (mediaEl) mediaEl.pause();
      if (ctx) ctx.suspend();
      setPlayState(false);
      stopRobot();
      if (el.liveDot) el.liveDot.classList.remove("live");
      setLiveStatus();
    }
  }

  /** The status line while a stream is live follows the toggle, never lags behind it. */
  function setLiveStatus() {
    setStatus(paused ? "Paused" : "Matthew is streaming");
  }

  function onPlayTap() {
    started = true;
    hasGesture = true;
    hidePlayButton();
    if (soundRunning && el.liveDot) el.liveDot.classList.add("live");

    // All of this must run synchronously in the gesture. Deferring any of it until the
    // socket or the worklet is ready forfeits the gesture credit in Safari.
    unlockIOS();
    createContext();
    ctx.resume();
    // Must happen inside the gesture: an <audio> element cannot start outside one.
    if (needsGesture()) routeThroughElement();
    ensureGraph();
    if (gain) gain.gain.value = currentGain();
    setPlayState(true);
    el.playButton.addEventListener("click", onPauseTap);
  }

  /**
   * Route the mix through an <audio> element instead of straight to ctx.destination.
   *
   * On iOS, raw Web Audio plays on the ringer channel, so the hardware mute switch
   * silences it. That looks exactly like a healthy pipeline producing no sound, and it
   * is what a full debug readout — buffer above target, ctx running, gain 1.0, Safari
   * showing its audio indicator — combined with total silence actually means. An
   * <audio> element plays on the media channel, which the mute switch does not control.
   *
   * A brief silent clip (unlockIOS below) is not enough on its own: it ends, and the
   * session falls back. This keeps a live element for as long as audio is playing.
   *
   * Swaps away from ctx.destination only once the element is genuinely playing, so a
   * failure here leaves the working route intact rather than producing silence.
   */
  function routeThroughElement() {
    if (mediaEl || !ctx || !gain || typeof ctx.createMediaStreamDestination !== "function") return;
    try {
      mediaDest = ctx.createMediaStreamDestination();
      gain.connect(mediaDest);
      mediaEl = document.createElement("audio");
      mediaEl.setAttribute("playsinline", "");
      mediaEl.autoplay = true;
      mediaEl.srcObject = mediaDest.stream;
      var p = mediaEl.play();
      if (p && p.then) {
        p.then(function () {
          try { gain.disconnect(ctx.destination); } catch (_) {}
          dbg.route = "element";
        }).catch(function () {
          try { gain.disconnect(mediaDest); } catch (_) {}
          mediaEl = null;
          dbg.route = "destination (element refused)";
        });
      }
    } catch (_) {
      dbg.route = "destination (element unavailable)";
    }
  }

  /**
   * iOS routes Web Audio through the ringer switch, but <audio> element playback through
   * the media channel. Playing a moment of silence through an element first flips the
   * session to media, so a phone on silent still plays the stream.
   */
  function unlockIOS() {
    try {
      var a = document.createElement("audio");
      a.setAttribute("playsinline", "");
      a.src = "data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
      a.volume = 0.01;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (_) {}
  }

  function onSoundStarted() {
    // Sound without a gesture means a browser started the context on its own. Stop it
    // rather than play: playback only ever starts from the tap.
    if (!hasGesture) {
      if (ctx && ctx.state === "running") ctx.suspend();
      return;
    }
    startMeters();
    soundRunning = true;
    if (!paused) startRobot();
    started = true;
    setLiveStatus();
    setHint("");

    // The green indicator means "you are hearing this", not "bytes are arriving". On a
    // device that requires a gesture we have no evidence of the former until the tap
    // happens, and showing green anyway is what made a silent iPad look like it was
    // playing. On desktop, where autoplay genuinely works, no tap is needed.
    if (el.liveDot) el.liveDot.classList.add("live");

    setPlayState(!paused);
    localStorage.setItem("trybaStreamPlayedHere", "1");
    // "Assume no sound is our fault" — offer help before they have to ask.
    setTimeout(function () {
      if (!touchedVolume && el.helpLink) el.helpLink.hidden = false;
    }, 6000);
  }

  // ---------------------------------------------------------------- controls

  function currentGain() {
    if (localStorage.getItem("trybaStreamMuted") === "1") return 0;
    var v = parseFloat(localStorage.getItem("trybaStreamVolume"));
    return isNaN(v) ? 0.8 : v;
  }

  function applyMuteVisual(muted) {
    if (el.mute) el.mute.textContent = muted ? "Unmute" : "Mute";
    // The slider keeps its position (so unmuting restores the same level) but the whole
    // control now reads as inactive. Previously gain went to zero while the slider still
    // looked like it was up, which is indistinguishable from a broken stream.
    var row = el.volume && el.volume.closest(".stream-controls");
    if (row) row.classList.toggle("is-muted", muted);
  }

  function restoreVolume() {
    var muted = localStorage.getItem("trybaStreamMuted") === "1";
    var v = parseFloat(localStorage.getItem("trybaStreamVolume"));
    if (isNaN(v)) v = 0.8;
    applyMuteVisual(muted);
    if (el.volume) {
      el.volume.value = String(Math.round(v * 100));
      el.volume.addEventListener("input", function () {
        touchedVolume = true;
        var nv = Number(el.volume.value) / 100;
        localStorage.setItem("trybaStreamVolume", String(nv));
        localStorage.setItem("trybaStreamMuted", "0");
        applyMuteVisual(false);
        if (gain) gain.gain.value = nv;
      });
    }
    if (el.mute) {
      el.mute.textContent = muted ? "Unmute" : "Mute";
      el.mute.addEventListener("click", function () {
        touchedVolume = true;
        var nowMuted = localStorage.getItem("trybaStreamMuted") !== "1";
        localStorage.setItem("trybaStreamMuted", nowMuted ? "1" : "0");
        applyMuteVisual(nowMuted);
        if (gain) gain.gain.value = nowMuted ? 0 : Number(el.volume.value) / 100;
      });
    }
    if (el.helpLink && el.helpPanel) {
      el.helpLink.addEventListener("click", function (e) {
        e.preventDefault();
        el.helpPanel.hidden = !el.helpPanel.hidden;
      });
    }
  }

  // ---------------------------------------------------------------- ui helpers

  function show(which) {
    ["screenLoading", "screenUnsupported", "screenFull", "screenPlayer"].forEach(function (k) {
      if (el[k]) el[k].hidden = k !== which;
    });
  }
  function setStatus(text) { if (el.statusLine) el.statusLine.textContent = text; }
  function setHint(text) {
    if (!el.statusHint) return;
    el.statusHint.textContent = text;
    el.statusHint.hidden = !text;
  }

  /**
   * On-screen diagnostics. Deliberately plain text and always visible when enabled —
   * a listener on a phone cannot open a console, and this is the only way to tell
   * starvation apart from a lost audio session.
   */
  function startDebugReadout() {
    var box = document.createElement("pre");
    box.className = "stream-debug";
    document.querySelector(".stream-wrap").appendChild(box);
    setInterval(function () {
      if (ctx) {
        var st = ctx.state;
        // An AudioContext that falls back to "interrupted"/"suspended" after running is
        // the signature of another app taking the audio session.
        if (dbg.ctxState === "running" && st !== "running") dbg.sessionDrops++;
        dbg.ctxState = st;
      }
      var since = dbg.lastAudioAt ? ((Date.now() - dbg.lastAudioAt) / 1000).toFixed(1) : "-";
      box.textContent =
        "ctx        " + dbg.ctxState + "   sessionDrops " + dbg.sessionDrops + "\n" +
        "rate       " + (ctx ? ctx.sampleRate : "-") + " Hz   clock " +
          (ctx ? ctx.currentTime.toFixed(1) : "-") + "s\n" +
        "route      " + dbg.route +
          (mediaEl ? "   el.paused " + mediaEl.paused : "") + "\n" +
        "net msgs   " + dbg.audioMsgs + "   last " + since + "s ago\n" +
        "decoded    " + dbg.decoded + " frames\n" +
        "buffer     " + dbg.buffered + " / " + dbg.target + " target\n" +
        "starved    " + dbg.starved + "   silent " + dbg.silent + "\n" +
        "gesture    " + hasGesture + "   soundRunning " + soundRunning + "\n" +
        "gain       " + (gain ? gain.gain.value.toFixed(2) : "-");
    }, 500);
  }
  function setError(text) { if (el.errorNote) { el.errorNote.textContent = text; el.errorNote.hidden = false; } }
})();
