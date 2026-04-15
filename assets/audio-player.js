/*--------------------------------------------------
  Audio Player — initAudioPlayer(config)

  Usage:
    1. Include audio-player.css and audio-player.js
    2. Add a mount element: <div id="player-root"></div>
    3. Define your TRACKS array (see config below)
    4. Call: initAudioPlayer({ tracks: TRACKS })

  Config options:
    tracks    {Array}   Required. Array of track objects.
    mountId   {string}  Optional. ID of mount element. Default: 'player-root'
    fallback  {object}  Optional. { text, url } for fallback link below players.

  Track object shape:
    {
      group:   "Group Label",   // Section heading. Tracks with same group are grouped together.
      title:   "Song Title",
      artist:  "Artist Name",   // Optional
      src:     "https://...",   // URL to MP3 (e.g. Cloudflare R2 public URL)
      artwork: "https://..."    // Optional. URL to artwork image.
    }
--------------------------------------------------*/

function initAudioPlayer(config) {
    const {
        tracks,
        mountId = 'player-root',
        fallback = null
    } = config;

    const root = document.getElementById(mountId);
    if (!root) {
        console.warn('initAudioPlayer: mount element not found:', mountId);
        return;
    }

    // -----------------------------------------------
    // Helpers
    // -----------------------------------------------
    function groupTracks(tracks) {
        const groups = [];
        const seen = {};
        tracks.forEach(track => {
            if (!seen[track.group]) {
                seen[track.group] = { label: track.group, tracks: [] };
                groups.push(seen[track.group]);
            }
            seen[track.group].tracks.push(track);
        });
        return groups;
    }

    function formatTime(secs) {
        if (isNaN(secs)) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    // -----------------------------------------------
    // Icons
    // -----------------------------------------------
    const ICON_PLAY  = `<svg class="icon-play" width="14" height="16" viewBox="0 0 14 16" fill="white"><polygon points="0,0 14,8 0,16"/></svg>`;
    const ICON_PAUSE = `<svg class="icon-pause" width="14" height="16" viewBox="0 0 14 16" fill="white"><rect x="0" y="0" width="5" height="16"/><rect x="9" y="0" width="5" height="16"/></svg>`;
    const ICON_NOTE  = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
    const ICON_VOL   = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;

    // -----------------------------------------------
    // Build artwork element
    // -----------------------------------------------
    function buildArtwork(src, alt) {
        if (src) {
            const img = document.createElement("img");
            img.src = src;
            img.alt = alt;
            img.className = "track-artwork";
            return img;
        }
        const div = document.createElement("div");
        div.className = "track-artwork placeholder";
        div.innerHTML = ICON_NOTE;
        return div;
    }

    // -----------------------------------------------
    // Build a single player card
    // -----------------------------------------------
    function buildPlayerCard(track) {
        const card = document.createElement("div");
        card.className = "player-card";

        // Track info row
        const info = document.createElement("div");
        info.className = "track-info";
        info.appendChild(buildArtwork(track.artwork, track.title));

        const meta = document.createElement("div");
        meta.className = "track-meta";
        meta.innerHTML = `<div class="track-title">${track.title}</div>${track.artist ? `<div class="track-artist">${track.artist}</div>` : ""}`;
        info.appendChild(meta);
        card.appendChild(info);

        // Controls row
        const controls = document.createElement("div");
        controls.className = "player-controls";

        const playBtn = document.createElement("button");
        playBtn.className = "play-btn";
        playBtn.setAttribute("aria-label", "Play");
        playBtn.innerHTML = ICON_PLAY;

        const progressWrapper = document.createElement("div");
        progressWrapper.className = "progress-wrapper";

        const barTrack = document.createElement("div");
        barTrack.className = "progress-bar-track";
        const barFill = document.createElement("div");
        barFill.className = "progress-bar-fill";
        barTrack.appendChild(barFill);

        const timeDisplay = document.createElement("div");
        timeDisplay.className = "time-display";
        timeDisplay.innerHTML = `<span class="current-time">0:00</span><span class="duration">0:00</span>`;

        progressWrapper.appendChild(barTrack);
        progressWrapper.appendChild(timeDisplay);
        controls.appendChild(playBtn);
        controls.appendChild(progressWrapper);
        card.appendChild(controls);

        // Audio element
        const audio = new Audio();
        if (track.src) {
            audio.src = track.src;
            audio.preload = "metadata";
        }

        const currentTimeEl = timeDisplay.querySelector(".current-time");
        const durationEl    = timeDisplay.querySelector(".duration");

        // Apply current global volume
        const volSlider = document.getElementById("audio-volume-slider");
        if (volSlider) audio.volume = volSlider.value / 100;

        // Wire up audio events
        audio.addEventListener("loadedmetadata", () => {
            durationEl.textContent = formatTime(audio.duration);
        });

        audio.addEventListener("timeupdate", () => {
            const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
            barFill.style.width = pct + "%";
            currentTimeEl.textContent = formatTime(audio.currentTime);
        });

        audio.addEventListener("ended", () => {
            playBtn.innerHTML = ICON_PLAY;
            playBtn.setAttribute("aria-label", "Play");
            barFill.style.width = "0%";
            currentTimeEl.textContent = "0:00";
        });

        // Play/pause toggle — pauses any other active player
        playBtn.addEventListener("click", () => {
            if (!track.src) {
                alert("No audio file set for this track yet.");
                return;
            }
            if (audio.paused) {
                document.querySelectorAll(".player-card").forEach(other => {
                    const otherAudio = other._audio;
                    if (otherAudio && otherAudio !== audio && !otherAudio.paused) {
                        otherAudio.pause();
                        other.querySelector(".play-btn").innerHTML = ICON_PLAY;
                        other.querySelector(".play-btn").setAttribute("aria-label", "Play");
                    }
                });
                audio.play();
                playBtn.innerHTML = ICON_PAUSE;
                playBtn.setAttribute("aria-label", "Pause");
            } else {
                audio.pause();
                playBtn.innerHTML = ICON_PLAY;
                playBtn.setAttribute("aria-label", "Play");
            }
        });

        // Seek on progress bar click
        barTrack.addEventListener("click", (e) => {
            if (!track.src || !audio.duration) return;
            const rect = barTrack.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pct * audio.duration;
        });

        card._audio = audio;
        return card;
    }

    // -----------------------------------------------
    // Build volume FAB element
    // -----------------------------------------------
    function buildVolumeControl() {
        const fab = document.createElement("div");
        fab.className = "audio-volume-fab";
        fab.innerHTML = `
            <div class="audio-volume-panel">
                <input type="range" class="audio-volume-slider" id="audio-volume-slider" min="0" max="100" value="80" aria-label="Volume">
                <span class="audio-volume-pct" id="audio-volume-pct">80%</span>
            </div>
            <button class="audio-volume-btn" aria-label="Volume">${ICON_VOL}</button>
        `;

        const btn = fab.querySelector(".audio-volume-btn");

        // Toggle open on click
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            fab.classList.toggle("open");
        });

        // Also open on hover (desktop)
        fab.addEventListener("mouseenter", () => fab.classList.add("open"));
        fab.addEventListener("mouseleave", () => fab.classList.remove("open"));

        // Close when clicking elsewhere
        document.addEventListener("click", () => fab.classList.remove("open"));

        return fab;
    }

    // -----------------------------------------------
    // Render
    // -----------------------------------------------

    // Inject volume FAB into body (desktop only)
    // Hidden initially — revealed when the player first scrolls into view.
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouchDevice) {
        const vc = buildVolumeControl();
        vc.classList.add("hidden");
        document.body.appendChild(vc);

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                vc.classList.remove("hidden");
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        observer.observe(root);
    }

    // Render track groups
    const groups = groupTracks(tracks);
    groups.forEach(group => {
        const groupEl = document.createElement("div");
        groupEl.className = "audio-group";

        const label = document.createElement("p");
        label.className = "audio-group-label";
        label.textContent = group.label;
        groupEl.appendChild(label);

        const grid = document.createElement("div");
        grid.className = "audio-grid";
        group.tracks.forEach(track => grid.appendChild(buildPlayerCard(track)));
        groupEl.appendChild(grid);
        root.appendChild(groupEl);
    });

    // Render optional fallback link
    if (fallback && fallback.url) {
        const p = document.createElement("p");
        p.className = "audio-fallback";
        p.innerHTML = `Audio not loading? <a href="${fallback.url}" target="_blank" rel="noopener">${fallback.text || 'Listen here'} →</a>`;
        root.parentNode.insertBefore(p, root.nextSibling);
    }

    // Wire up volume slider
    const volSlider = document.getElementById("audio-volume-slider");
    const volPct    = document.getElementById("audio-volume-pct");

    function updateVolume(val) {
        const v = val / 100;
        document.querySelectorAll(".player-card").forEach(card => {
            if (card._audio) card._audio.volume = v;
        });
        if (volPct)    volPct.textContent = val + "%";
        if (volSlider) volSlider.style.setProperty("--vol-pct", val + "%");
        // Vertical slider: gradient runs bottom-to-top, so fill = value%
        // (already handled by the CSS linear-gradient direction)
    }

    if (volSlider) {
        volSlider.addEventListener("input", () => updateVolume(volSlider.value));
        updateVolume(volSlider.value);
    }
}
