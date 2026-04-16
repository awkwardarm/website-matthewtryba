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

    // Shared now-playing state
    let _activeAudio    = null;
    let _activePlayBtn  = null;
    let _activeTimeUpdate = null;
    let _bar            = null; // assigned during render
    let _visibleCards   = [];   // populated after render; used for prev/next

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
    const ICON_PREV  = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="0" width="3" height="16"/><polygon points="15,0 4,8 15,16"/></svg>`;
    const ICON_NEXT  = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="13" y="0" width="3" height="16"/><polygon points="1,0 12,8 1,16"/></svg>`;

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
    // Activate the now-playing bar for a track
    // -----------------------------------------------
    function activateBar(track, audio, cardPlayBtn) {
        if (!_bar) return;

        // Detach previous timeupdate listener
        if (_activeTimeUpdate && _activeAudio) {
            _activeAudio.removeEventListener("timeupdate", _activeTimeUpdate);
        }
        _activeAudio   = audio;
        _activePlayBtn = cardPlayBtn;

        // Update track info
        const artWrap = _bar.querySelector(".np-artwork-wrap");
        artWrap.innerHTML = "";
        artWrap.appendChild(buildArtwork(track.artwork, track.title));
        _bar.querySelector(".np-title").textContent  = track.title;
        _bar.querySelector(".np-artist").textContent = track.artist || "";

        // Update duration (may already be known)
        const npDuration = _bar.querySelector(".np-duration");
        npDuration.textContent = audio.duration ? formatTime(audio.duration) : "0:00";
        if (!audio.duration) {
            audio.addEventListener("loadedmetadata", function onMeta() {
                if (_activeAudio === audio) npDuration.textContent = formatTime(audio.duration);
                audio.removeEventListener("loadedmetadata", onMeta);
            });
        }

        // Bind timeupdate to bar progress
        const npBarFill = _bar.querySelector(".np-bar-fill");
        const npCurrent = _bar.querySelector(".np-current");
        _activeTimeUpdate = () => {
            const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
            npBarFill.style.width = pct + "%";
            npCurrent.textContent = formatTime(audio.currentTime);
        };
        audio.addEventListener("timeupdate", _activeTimeUpdate);

        // Sync bar play button
        const npPlayBtn = _bar.querySelector(".np-play-btn");
        npPlayBtn.innerHTML = ICON_PAUSE;
        npPlayBtn.setAttribute("aria-label", "Pause");

        // Slide bar up
        _bar.classList.add("active");
    }

    // -----------------------------------------------
    // Build a single player card
    // -----------------------------------------------
    function buildPlayerCard(track) {
        const card = document.createElement("div");
        card.className = "player-card";

        // Track info (artwork + meta), fills remaining space
        const info = document.createElement("div");
        info.className = "track-info";
        info.appendChild(buildArtwork(track.artwork, track.title));

        const meta = document.createElement("div");
        meta.className = "track-meta";
        meta.innerHTML = `<div class="track-title">${track.title}</div>${track.artist ? `<div class="track-artist">${track.artist}</div>` : ""}`;
        info.appendChild(meta);
        card.appendChild(info);

        // Play button at the end of the row
        const playBtn = document.createElement("button");
        playBtn.className = "play-btn";
        playBtn.setAttribute("aria-label", "Play");
        playBtn.innerHTML = ICON_PLAY;
        card.appendChild(playBtn);

        // Audio element
        const audio = new Audio();
        if (track.src) {
            audio.src = track.src;
            audio.preload = "metadata";
        }

        // Apply current global volume
        const volSlider = document.getElementById("audio-volume-slider");
        if (volSlider) audio.volume = volSlider.value / 100;

        audio.addEventListener("ended", () => {
            playBtn.innerHTML = ICON_PLAY;
            playBtn.setAttribute("aria-label", "Play");
            if (_bar && _activeAudio === audio) {
                _bar.querySelector(".np-play-btn").innerHTML = ICON_PLAY;
                _bar.querySelector(".np-play-btn").setAttribute("aria-label", "Play");
                _bar.querySelector(".np-bar-fill").style.width = "0%";
                _bar.querySelector(".np-current").textContent = "0:00";
            }
        });

        playBtn.addEventListener("click", () => {
            if (!track.src) {
                alert("No audio file set for this track yet.");
                return;
            }
            if (audio.paused) {
                // Pause all other players
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
                activateBar(track, audio, playBtn);
            } else {
                audio.pause();
                playBtn.innerHTML = ICON_PLAY;
                playBtn.setAttribute("aria-label", "Play");
                if (_bar) {
                    _bar.querySelector(".np-play-btn").innerHTML = ICON_PLAY;
                    _bar.querySelector(".np-play-btn").setAttribute("aria-label", "Play");
                }
            }
        });

        card._audio = audio;
        card.dataset.trackTitle = track.title;
        return card;
    }

    // -----------------------------------------------
    // Build now-playing bar
    // -----------------------------------------------
    function buildNowPlayingBar(hideVolume) {
        const bar = document.createElement("div");
        bar.className = "now-playing-bar";
        bar.innerHTML = `
            <div class="np-track">
                <div class="np-artwork-wrap"></div>
                <div class="np-meta">
                    <div class="np-title">—</div>
                    <div class="np-artist"></div>
                </div>
            </div>
            <div class="np-controls">
                <button class="np-prev-btn" aria-label="Previous">${ICON_PREV}</button>
                <button class="np-play-btn play-btn" aria-label="Play">${ICON_PLAY}</button>
                <button class="np-next-btn" aria-label="Next">${ICON_NEXT}</button>
                <div class="np-progress">
                    <div class="np-bar-track"><div class="np-bar-fill"></div></div>
                    <div class="np-time">
                        <span class="np-current">0:00</span>
                        <span class="np-duration">0:00</span>
                    </div>
                </div>
            </div>
            ${hideVolume ? '' : `
            <div class="np-volume">
                ${ICON_VOL}
                <input type="range" class="audio-volume-slider" id="audio-volume-slider" min="0" max="100" value="80" aria-label="Volume">
                <span class="audio-volume-pct" id="audio-volume-pct">80%</span>
            </div>`}
        `;

        // Bar play/pause button
        const npPlayBtn = bar.querySelector(".np-play-btn");
        npPlayBtn.addEventListener("click", () => {
            if (!_activeAudio) return;
            if (_activeAudio.paused) {
                _activeAudio.play();
                npPlayBtn.innerHTML = ICON_PAUSE;
                npPlayBtn.setAttribute("aria-label", "Pause");
                if (_activePlayBtn) {
                    _activePlayBtn.innerHTML = ICON_PAUSE;
                    _activePlayBtn.setAttribute("aria-label", "Pause");
                }
            } else {
                _activeAudio.pause();
                npPlayBtn.innerHTML = ICON_PLAY;
                npPlayBtn.setAttribute("aria-label", "Play");
                if (_activePlayBtn) {
                    _activePlayBtn.innerHTML = ICON_PLAY;
                    _activePlayBtn.setAttribute("aria-label", "Play");
                }
            }
        });

        // Seek on bar progress click
        const npBarTrack = bar.querySelector(".np-bar-track");
        npBarTrack.addEventListener("click", (e) => {
            if (!_activeAudio || !_activeAudio.duration) return;
            const rect = npBarTrack.getBoundingClientRect();
            _activeAudio.currentTime = ((e.clientX - rect.left) / rect.width) * _activeAudio.duration;
        });

        // Prev / Next buttons
        function skipTrack(dir) {
            if (!_visibleCards.length) return;
            const idx = _visibleCards.findIndex(c => c._audio === _activeAudio);
            const next = idx === -1
                ? 0
                : (idx + dir + _visibleCards.length) % _visibleCards.length;
            _visibleCards[next].querySelector(".play-btn").click();
        }

        bar.querySelector(".np-prev-btn").addEventListener("click", () => skipTrack(-1));
        bar.querySelector(".np-next-btn").addEventListener("click", () => skipTrack(1));

        return bar;
    }

    // -----------------------------------------------
    // Render
    // -----------------------------------------------

    // Build and inject now-playing bar (all devices; volume hidden on touch)
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    _bar = buildNowPlayingBar(isTouchDevice);
    document.body.appendChild(_bar);

    // Render track groups
    const groups = groupTracks(tracks);

    // Hidden group container — cards exist in DOM for click-to-play but are not visible
    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;";
    document.body.appendChild(hiddenContainer);

    groups.forEach(group => {
        if (group.label === "hidden") {
            group.tracks.forEach(track => hiddenContainer.appendChild(buildPlayerCard(track)));
            return;
        }

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

    // Build visible card list for prev/next navigation (excludes hidden group)
    _visibleCards = [...root.querySelectorAll(".player-card")];

    // Render optional fallback link
    if (fallback && fallback.url) {
        const p = document.createElement("p");
        p.className = "audio-fallback";
        p.innerHTML = `Audio not loading? <a href="${fallback.url}" target="_blank" rel="noopener">${fallback.text || 'Listen here'} →</a>`;
        root.parentNode.insertBefore(p, root.nextSibling);
    }

    // Wire up any [data-play-title] elements on the page (e.g. social proof album art)
    const ICON_PLAY_CIRCLE = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="rgba(0,0,0,0.45)"/><polygon points="14,11 28,18 14,25" fill="white"/></svg>`;
    document.querySelectorAll("[data-play-title]").forEach(img => {
        const wrapper = document.createElement("span");
        wrapper.className = "play-trigger";
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        const overlay = document.createElement("span");
        overlay.className = "play-trigger-icon";
        overlay.innerHTML = ICON_PLAY_CIRCLE;
        wrapper.appendChild(overlay);

        wrapper.addEventListener("click", () => {
            const title = img.dataset.playTitle;
            const card = [...document.querySelectorAll(".player-card")]
                .find(c => c.dataset.trackTitle === title);
            if (card) card.querySelector(".play-btn").click();
        });
    });

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
    }

    if (volSlider) {
        volSlider.addEventListener("input", () => updateVolume(volSlider.value));
        updateVolume(volSlider.value);
    }
}
