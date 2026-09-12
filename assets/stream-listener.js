/**
 * Tryba Stream listener — WebSocket → WebCodecs AudioDecoder → AudioWorklet.
 *
 * Design notes that matter (PLAN.md §4):
 *  - Autoplay is attempted first; the Play button is the fallback, not the default.
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
  var fullPoll = null;
  var firstAudioAt = 0;
  var touchedVolume = false;

  // ---------------------------------------------------------------- boot

  document.addEventListener("DOMContentLoaded", function () {
    ["screen-loading","screen-unsupported","screen-full","screen-player","play-button","play-label",
     "status-line","volume","mute","help-link","help-panel","live-dot","error-note",
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
      tryAutoplay();
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
      // Honest default: the page says nothing is playing until a HELLO proves otherwise.
      show("screenPlayer");
      setStatus("Waiting for Matthew to start");
      hidePlayButton();
    });

    ws.addEventListener("message", function (e) {
      if (typeof e.data === "string") return handleText(e.data, room);
      handleBinary(e.data);
    });

    ws.addEventListener("close", function (e) {
      if (e.code === 4001) return;            // FULL already handled
      if (!started) setStatus("Waiting for Matthew to start");
      setTimeout(function () { connect(room); }, 2000);
    });
  }

  function handleText(raw, room) {
    var m;
    try { m = JSON.parse(raw); } catch (_) { return; }

    if (m.t === "state") {
      live = !!m.live;
      if (!live) goOffAir("Waiting for Matthew to start");
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
    setStatus("Matthew is streaming");
    // Only now is a Play button meaningful — there is audio for it to start.
    if (!soundRunning && !ctxAllowedAutoplay) showPlayButton();
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
  }

  function onDecoded(audioData) {
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
    goOffAir("Stream ended");
  }

  /**
   * No audio is coming. Tear the playback state back down so that if the stream
   * returns, the page starts cleanly rather than resuming a half-primed buffer — and
   * so no Play button is left on screen promising sound it cannot deliver.
   */
  function goOffAir(message) {
    live = false;
    soundRunning = false;
    started = false;
    hello = null;
    epoch = null;
    if (decoder) { try { decoder.close(); } catch (_) {} decoder = null; }
    if (node) node.port.postMessage({ type: "reset" });
    firstAudioAt = 0;
    show("screenPlayer");
    setStatus(message);
    hidePlayButton();
    if (el.liveDot) el.liveDot.classList.remove("live");
  }

  function hidePlayButton() {
    if (el.playButton) el.playButton.hidden = true;
    if (el.playLabel) el.playLabel.hidden = true;
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
        if (e.data.type === "stats" && !e.data.silent && !soundRunning) onSoundStarted();
      };
      node.connect(gain);
    });
  }

  var ctxAllowedAutoplay = false;

  function tryAutoplay() {
    createContext();
    ctx.resume().then(function () {
      if (ctx.state === "running") {
        // Allowed. Sound begins as soon as the buffer primes; no button ever shown.
        ctxAllowedAutoplay = true;
        hidePlayButton();
        ensureGraph();
      } else {
        showPlayButton();
      }
    }).catch(function () { showPlayButton(); });

    // Safari can report "running" and still stay silent until a gesture. Fall back to
    // the button — but only once audio is actually arriving, so a listener waiting for
    // a stream that has not started is never shown a button that does nothing.
    setTimeout(function () {
      if (!soundRunning && !started && live && firstAudioAt) showPlayButton();
    }, 1200);
  }

  function showPlayButton() {
    // A Play button is a promise that tapping it produces sound. Never show one unless
    // there is a live stream behind it.
    if (!el.playButton || started || !live || !hello) return;
    el.playButton.hidden = false;
    if (el.playLabel) el.playLabel.hidden = false;
    el.playButton.addEventListener("click", onPlayTap, { once: true });
  }

  function onPlayTap() {
    started = true;
    hidePlayButton();

    // All of this must run synchronously in the gesture.
    createContext();
    ctx.resume();
    unlockIOS();
    ensureGraph();
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
      a.src = "data:audio/mp4;base64,AAAAHGZ0eXBNNEEgAAAAAE00QSBtcDQyaXNvbQAAAAhmcmVl" +
              "AAAAG21kYXQhsAAAAAAAAAAAAAAAAAAAAAAAAAAA";
      a.volume = 0.01;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (_) {}
  }

  function onSoundStarted() {
    soundRunning = true;
    started = true;
    hidePlayButton();
    if (el.liveDot) el.liveDot.classList.add("live");
    localStorage.setItem("trybaStreamPlayedHere", "1");
    setStatus("Matthew is streaming");
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

  function restoreVolume() {
    var muted = localStorage.getItem("trybaStreamMuted") === "1";
    var v = parseFloat(localStorage.getItem("trybaStreamVolume"));
    if (isNaN(v)) v = 0.8;
    if (el.volume) {
      el.volume.value = String(Math.round(v * 100));
      el.volume.addEventListener("input", function () {
        touchedVolume = true;
        var nv = Number(el.volume.value) / 100;
        localStorage.setItem("trybaStreamVolume", String(nv));
        localStorage.setItem("trybaStreamMuted", "0");
        if (el.mute) el.mute.textContent = "Mute";
        if (gain) gain.gain.value = nv;
      });
    }
    if (el.mute) {
      el.mute.textContent = muted ? "Unmute" : "Mute";
      el.mute.addEventListener("click", function () {
        touchedVolume = true;
        var nowMuted = localStorage.getItem("trybaStreamMuted") !== "1";
        localStorage.setItem("trybaStreamMuted", nowMuted ? "1" : "0");
        el.mute.textContent = nowMuted ? "Unmute" : "Mute";
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
  function setError(text) { if (el.errorNote) { el.errorNote.textContent = text; el.errorNote.hidden = false; } }
})();
