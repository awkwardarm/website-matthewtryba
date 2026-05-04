/**
 * ============================================================
 * AUDIO PLAYER — initAudioPlayer(config)
 * ============================================================
 * 
 * PURPOSE:
 *     This is the main audio player component logic. It creates
 *     a fully functional music player with:
 *           - Track grid organized by groups
 *           - Play/pause controls
 *           - Now Playing bar (fixed bottom)
 *           - Seek functionality (clickable progress bar)
 *           - Volume control (slider + popup)
 *           - Prev/Next navigation (cross-page aware)
 *           - State persistence via localStorage
 * 
 * USAGE:
 *      1. Include audio-player.css and audio-player.js in your page
 *      2. Add a mount element: <div id="player-root"></div>
 *      3. Define your TRACKS array (see audio-player-tracks.js)
 *      4. Call: initAudioPlayer({ tracks: TRACKS })
 * 
 * CONFIG OPTIONS:
 *      tracks     {Array}   Required. Array of track objects.
 *      mountId    {string}  Optional. ID of mount element. Default: 'player-root'
 *      fallback   {object}  Optional. { text, url } for fallback link.
 * 
 * TRACK OBJECT SHAPE:
 *      {
 *          group:     "Group Label",    // Section heading. Same group → grouped together.
 *          title:     "Song Title",     // Displayed in player
 *          artist:    "Artist Name",    // Optional. Displayed below title
 *          src:       "https://...",    // URL to MP3 (e.g., Cloudflare R2 public URL)
 *          artwork:   "https://..."    // Optional. URL to album cover image
 *      }
 * 
 * ============================================================
 */

function initAudioPlayer(config) {
     // Prevent double-initialization (e.g., if both page footer and
     // global injection try to call init). The guard ensures this
     // function only runs once per page load.
    if (window._audioPlayerInitialized) return;
    window._audioPlayerInitialized = true;

     // Extract config options with defaults
    const {
        tracks,
        mountId = 'player-root',
        fallback = null
      } = config;

     // Get the mount element (e.g., #player-root)
    const root = document.getElementById(mountId);
    const hasRoot = !!root;

     // -----------------------------------------------
     // SHARED NOW-PLAYING STATE
     // -----------------------------------------------
     // These variables track the current playback state
     // across the entire page session. They are shared
     // between card players and the now-playing bar.
     // -----------------------------------------------
    let _activeAudio        = null;    // Current HTMLAudioElement
    let _activePlayBtn      = null;    // Current play button element (card or bar)
    let _activeTimeUpdate = null;    // Current timeupdate listener (for cleanup)
    let _bar                = null;   // Assigned during render — the now-playing bar DOM node
    let _visibleCards       = [];     // Populated after render — card elements for prev/next
    let _activeTrackIndex = -1;     // Index into _playableTracks — used for cross-page skip

     // All non-hidden tracks in order — used for prev/next
     // navigation on any page (even pages without the full grid)
    const _playableTracks = tracks.filter(t => t.group !== 'hidden');

     // -----------------------------------------------
     // HELPER FUNCTIONS
     // -----------------------------------------------

    /**
     * groupTracks() — Organizes flat track array into grouped sections
     * 
     * Takes the flat TRACKS array and groups tracks by their `group`
     * field. Returns an array of { label, tracks } objects.
     * 
     * Example:
     *     Input:   [{group: "A", title: "1"}, {group: "B", title: "2"}, {group: "A", title: "3"}]
     *     Output: [{label: "A", tracks: [...]}, {label: "B", tracks: [...]}]
     * 
     * @param {Array} tracks — Flat array of track objects
     * @returns {Array} Array of { label, tracks } group objects
     */
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

    /**
     * formatTime() — Converts seconds to MM:SS format
     * 
     * Used to display playback time in both card players
     * and the now-playing bar.
     * 
     * @param {number} secs — Time in seconds
     * @returns {string} Formatted time string (e.g., "3:45")
     */
    function formatTime(secs) {
        if (isNaN(secs)) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
       }

     // -----------------------------------------------
     // PERSISTENCE — localStorage save/restore
     // -----------------------------------------------
     // These functions persist the current playback state
     // (track index, current time, playing/paused) to
     // localStorage. This allows playback to continue
     // seamlessly when the user navigates to another page.
     // -----------------------------------------------
    const STORAGE_KEY = 'tryba-player-state';

    /**
     * saveState() — Saves current playback state to localStorage
     * 
     * @param {number} trackIndex — Index in _playableTracks
     * @param {HTMLAudioElement} audio — Current audio element
     * @param {boolean} isPlaying — Play or pause state
     * @param {number} [currentTimeOverride] — Optional current time override
     */
    function saveState(trackIndex, audio, isPlaying, currentTimeOverride) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                trackIndex,
                currentTime: currentTimeOverride !== undefined ? currentTimeOverride : audio.currentTime,
                isPlaying
              }));
           } catch (e) { /* storage unavailable */ }
       }

    /**
     * clearState() — Removes playback state from localStorage
     * Called when playback ends or is manually reset.
     */
    function clearState() {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
       }

    /**
     * loadState() — Loads playback state from localStorage
     * 
     * @returns {Object|null} State object { trackIndex, currentTime, isPlaying } or null
     */
    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
           } catch (e) { return null; }
       }

     // -----------------------------------------------
     // ICONS — SVG definitions
     // -----------------------------------------------
     // Predefined SVG strings for player controls.
     // Using inline SVGs avoids external dependencies.
     // -----------------------------------------------
    const ICON_PLAY    = `<svg class="icon-play" width="14" height="16" viewBox="0 0 14 16" fill="white"><polygon points="0,0 14,8 0,16"/></svg>`;
    const ICON_PAUSE = `<svg class="icon-pause" width="14" height="16" viewBox="0 0 14 16" fill="white"><rect x="0" y="0" width="5" height="16"/><rect x="9" y="0" width="5" height="16"/></svg>`;
    const ICON_NOTE    = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
    const ICON_VOL     = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
    const ICON_PREV    = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="0" width="3" height="16"/><polygon points="15,0 4,8 15,16"/></svg>`;
    const ICON_NEXT    = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="13" y="0" width="3" height="16"/><polygon points="1,0 12,8 1,16"/></svg>`;

     // -----------------------------------------------
     // BUILD ARTWORK — Create album art element
     // -----------------------------------------------

    /**
     * buildArtwork() — Creates an album art image or placeholder
     * 
     * If an artwork URL is provided, creates an <img> element.
     * Otherwise, creates a placeholder <div> with a music note icon.
     * 
     * @param {string} src — URL to artwork image (optional)
     * @param {string} alt — Alt text for the image
     * @returns {HTMLElement} Image or placeholder div
     */
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
     // ACTIVATE BAR — Activate now-playing bar for a track
     // -----------------------------------------------

    /**
     * activateBar() — Activates the now-playing bar for a specific track
     * 
     * This is called when a user clicks play on any track. It:
     *     1. Detaches any previous timeupdate listener
     *     2. Updates the bar with track info (title, artist, artwork)
     *     3. Binds the progress bar to audio timeupdate events
     *     4. Syncs the bar play button with card play button
     *     5. Slides the bar up (adds .active class)
     * 
     * @param {Object} track — Track object { group, title, artist, src, artwork }
     * @param {HTMLAudioElement} audio — Audio element for the track
     * @param {HTMLElement} cardPlayBtn — Play button from the card (may be null for ghost play)
     */
    function activateBar(track, audio, cardPlayBtn) {
         // Detach previous timeupdate listener to prevent memory leaks
        if (_activeTimeUpdate && _activeAudio) {
                _activeAudio.removeEventListener("timeupdate", _activeTimeUpdate);
            }
            _activeAudio     = audio;
            _activePlayBtn = cardPlayBtn;
            _activeTrackIndex = _playableTracks.findIndex(t => t.src === track.src && t.title === track.title);

         // Update track info in the now-playing bar
        const artWrap = _bar.querySelector(".np-artwork-wrap");
        artWrap.innerHTML = "";
        artWrap.appendChild(buildArtwork(track.artwork, track.title));
            _bar.querySelector(".np-title").textContent    = track.title;
            _bar.querySelector(".np-artist").textContent = track.artist || "";

         // Update duration display (may already be known from metadata)
        const npDuration = _bar.querySelector(".np-duration");
        npDuration.textContent = audio.duration ? formatTime(audio.duration) : "0:00";
        if (!audio.duration) {
            audio.addEventListener("loadedmetadata", function onMeta() {
                if (_activeAudio === audio) npDuration.textContent = formatTime(audio.duration);
                audio.removeEventListener("loadedmetadata", onMeta);
               });
           }

         // Bind timeupdate listener to update progress bar
        const npBarFill = _bar.querySelector(".np-bar-fill");
        const npCurrent = _bar.querySelector(".np-current");
        let _lastSavedSec = -1;    // Debounce: save at most once per second
            _activeTimeUpdate = () => {
            const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
            npBarFill.style.width = pct + "%";
            npCurrent.textContent = formatTime(audio.currentTime);
              // Persist state at most once per second while playing
            const sec = Math.floor(audio.currentTime);
            if (sec !== _lastSavedSec) {
                    _lastSavedSec = sec;
                saveState(_activeTrackIndex, audio, !audio.paused);
               }
           };
        audio.addEventListener("timeupdate", _activeTimeUpdate);

         // Sync bar play button icon with card play button
        const npPlayBtn = _bar.querySelector(".np-play-btn");
        npPlayBtn.innerHTML = ICON_PAUSE;
        npPlayBtn.setAttribute("aria-label", "Pause");

         // Slide bar up into view
            _bar.classList.add("active");
       }

     // -----------------------------------------------
     // BUILD PLAYER CARD — Create a track card element
     // -----------------------------------------------

    /**
     * buildPlayerCard() — Creates a playable track card DOM element
     * 
     * Each card displays:
     *     [Album Art] [Track Title / Artist] [Play Button]
     * 
     * Clicking the play button triggers audio playback and
     * activates the now-playing bar.
     * 
     * @param {Object} track — Track object { group, title, artist, src, artwork }
     * @returns {HTMLElement} Player card div
     */
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

          // Audio element — stores the actual audio data
        const audio = new Audio();
        if (track.src) {
            audio.src = track.src;
            audio.preload = "metadata";    // Load metadata only (not full file)
           }

          // Apply current global volume to this audio element
        const volSlider = document.getElementById("audio-volume-slider");
        if (volSlider) audio.volume = volSlider.value / 100;

          // Audio ended handler — reset play buttons
        audio.addEventListener("ended", () => {
            clearState();
            playBtn.innerHTML = ICON_PLAY;
            playBtn.setAttribute("aria-label", "Play");
            if (_bar && _activeAudio === audio) {
                    _bar.querySelector(".np-play-btn").innerHTML = ICON_PLAY;
                    _bar.querySelector(".np-play-btn").setAttribute("aria-label", "Play");
                    _bar.querySelector(".np-bar-fill").style.width = "0%";
                    _bar.querySelector(".np-current").textContent = "0:00";
                }
           });

          // Play/Pause click handler
        playBtn.addEventListener("click", () => {
            if (!track.src) {
                alert("No audio file set for this track yet.");
                return;
               }
            if (audio.paused) {
                  // Pause all other active players first
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
                saveState(_activeTrackIndex, audio, true);
               } else {
                audio.pause();
                playBtn.innerHTML = ICON_PLAY;
                playBtn.setAttribute("aria-label", "Play");
                if (_bar) {
                        _bar.querySelector(".np-play-btn").innerHTML = ICON_PLAY;
                        _bar.querySelector(".np-play-btn").setAttribute("aria-label", "Play");
                    }
                saveState(_activeTrackIndex, audio, false);
               }
           });

        card._audio = audio;    // Store audio reference on card for volume updates
        card.dataset.trackTitle = track.title;    // For matching tracks across components
        return card;
       }

     // -----------------------------------------------
     // BUILD NOW PLAYING BAR — Fixed bottom playback bar
     // -----------------------------------------------

    /**
     * buildNowPlayingBar() — Creates the fixed bottom now-playing bar
     * 
     * The bar contains:
     *     [Track Info] [Prev] [Play/Pause] [Next] [Progress Bar + Time] [Volume]
     * 
     * It is hidden by default (off-screen) and slides up when
     * a track starts playing (via .active class).
     * 
     * @param {boolean} hideVolume — Whether to hide volume controls (touch devices)
     * @returns {HTMLElement} Now playing bar div
     */
    function buildNowPlayingBar(hideVolume) {
        const bar = document.createElement("div");
        bar.className = "now-playing-bar";
        bar.innerHTML = `
              <div class="np-inner">
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
                  <button class="np-volume-btn" aria-label="Volume" aria-pressed="false">
                      ${ICON_VOL}
                  </button>
                  <div class="np-volume-popup">
                      <input type="range" class="audio-volume-slider" id="audio-volume-slider" min="0" max="100" value="80" aria-label="Volume">
                      <span class="audio-volume-pct" id="audio-volume-pct">80%</span>
                  </div>
              </div>`}
              </div>
          `;

          // Bar play/pause button handler
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
                saveState(_activeTrackIndex, _activeAudio, true);
               } else {
                   _activeAudio.pause();
                npPlayBtn.innerHTML = ICON_PLAY;
                npPlayBtn.setAttribute("aria-label", "Play");
                if (_activePlayBtn) {
                        _activePlayBtn.innerHTML = ICON_PLAY;
                        _activePlayBtn.setAttribute("aria-label", "Play");
                    }
                saveState(_activeTrackIndex, _activeAudio, false);
               }
           });

          // Seek on bar progress click — calculate position from click
        const npBarTrack = bar.querySelector(".np-bar-track");
        npBarTrack.addEventListener("click", (e) => {
            if (!_activeAudio || !_activeAudio.duration) return;
            const rect = npBarTrack.getBoundingClientRect();
                _activeAudio.currentTime = ((e.clientX - rect.left) / rect.width) * _activeAudio.duration;
           });

          /**
           * skipTrack() — Helper for prev/next navigation
           * 
           * Handles cross-page track skipping by referencing
           * the global _playableTracks array. If the next track
           * has a card on the current page, it plays via card.
           * Otherwise, it uses ghost mode (plays without visible card).
           * 
           * @param {number} dir — Direction: -1 (prev) or 1 (next)
           */
        function skipTrack(dir) {
            if (!_playableTracks.length) return;
            const baseIdx = _activeTrackIndex === -1 ? 0 : _activeTrackIndex;
            const nextIdx = (baseIdx + dir + _playableTracks.length) % _playableTracks.length;
            const nextTrack = _playableTracks[nextIdx];
              // Find a card on the current page for this track
            const card = [...document.querySelectorAll(".player-card")]
                   .find(c => c.dataset.trackTitle === nextTrack.title);
            if (card) {
                card.querySelector(".play-btn").click();
               } else {
                   // Ghost mode: play without a card (no visible player grid on this page)
                ghostPlay(nextTrack, nextIdx);
               }
           }

        bar.querySelector(".np-prev-btn").addEventListener("click", () => skipTrack(-1));
        bar.querySelector(".np-next-btn").addEventListener("click", () => skipTrack(1));

        return bar;
       }

     // -----------------------------------------------
     // GHOST PLAY — Play track without a visible card
     // -----------------------------------------------

    /**
     * ghostPlay() — Plays a track without a visible card element
     * 
     * Used for prev/next navigation when the next track doesn't
     * have a card on the current page. Creates a temporary Audio
     * element and activates the now-playing bar directly.
     * 
     * @param {Object} track — Track object to play
     * @param {number} trackIndex — Index in _playableTracks
     */
    function ghostPlay(track, trackIndex) {
          // Pause any currently active audio
        if (_activeAudio && !_activeAudio.paused) {
                _activeAudio.pause();
            if (_activePlayBtn) {
                    _activePlayBtn.innerHTML = ICON_PLAY;
                    _activePlayBtn.setAttribute("aria-label", "Play");
                }
           }

        const audio = new Audio(track.src);
        audio.preload = "metadata";

          // Reset bar on track end
        audio.addEventListener("ended", () => {
            clearState();
            if (_bar) {
                    _bar.querySelector(".np-play-btn").innerHTML = ICON_PLAY;
                    _bar.querySelector(".np-play-btn").setAttribute("aria-label", "Play");
                    _bar.querySelector(".np-bar-fill").style.width = "0%";
                    _bar.querySelector(".np-current").textContent = "0:00";
                }
           });

        activateBar(track, audio, null);

        // Play with autoplay error handling
        audio.play().catch(() => {
              // Autoplay blocked — bar shows in paused state
            if (_bar) {
                    _bar.querySelector(".np-play-btn").innerHTML = ICON_PLAY;
                    _bar.querySelector(".np-play-btn").setAttribute("aria-label", "Play");
                }
            saveState(_activeTrackIndex, audio, false);
           });
       }

     // -----------------------------------------------
     // RESTORE STATE — Restore playback from localStorage
     // -----------------------------------------------

    /**
     * restoreState() — Restores playback state from localStorage
     * 
     * Called after the player renders. Checks localStorage for a
     * saved state and restores:
     *     - Which track was playing
     *     - Current playback position (seconds)
     *     - Playing or paused state
     * 
     * If the track has a visible card on the current page, it uses
     * the card's audio element. Otherwise, it uses ghost mode.
     */
    function restoreState() {
        const state = loadState();
        if (!state) return;

        const { trackIndex, currentTime, isPlaying } = state;
        const track = _playableTracks[trackIndex];
        if (!track || !track.src) return;

          // Try to find a visible card on this page for this track
        const card = [...document.querySelectorAll(".player-card")]
               .find(c => c.dataset.trackTitle === track.title);

        if (card) {
               // Full player mode — use the card's audio element
            const audio = card._audio;
            if (audio.readyState >= 1) {
                audio.currentTime = currentTime;
               } else {
                audio.addEventListener("loadedmetadata", function onMeta() {
                    audio.currentTime = currentTime;
                    audio.removeEventListener("loadedmetadata", onMeta);
                   });
               }
            activateBar(track, audio, card.querySelector(".play-btn"));
            if (isPlaying) {
                audio.play().then(() => {
                    card.querySelector(".play-btn").innerHTML = ICON_PAUSE;
                    card.querySelector(".play-btn").setAttribute("aria-label", "Pause");
                   }).catch(() => {
                        // Autoplay blocked (mobile); show paused state and preserve position
                       _bar.querySelector(".np-play-btn").innerHTML = ICON_PLAY;
                       _bar.querySelector(".np-play-btn").setAttribute("aria-label", "Play");
                    saveState(trackIndex, audio, false, currentTime);
                   });
               } else {
                   _bar.querySelector(".np-play-btn").innerHTML = ICON_PLAY;
                   _bar.querySelector(".np-play-btn").setAttribute("aria-label", "Play");
               }
           } else {
               // Ghost mode — play without a card
            const audio = new Audio(track.src);
            audio.preload = "metadata";

            if (audio.readyState >= 1) {
                audio.currentTime = currentTime;
               } else {
                audio.addEventListener("loadedmetadata", function onMeta() {
                    audio.currentTime = currentTime;
                    audio.removeEventListener("loadedmetadata", onMeta);
                   });
               }

            audio.addEventListener("ended", () => {
                clearState();
                if (_bar) {
                        _bar.querySelector(".np-play-btn").innerHTML = ICON_PLAY;
                        _bar.querySelector(".np-play-btn").setAttribute("aria-label", "Play");
                        _bar.querySelector(".np-bar-fill").style.width = "0%";
                        _bar.querySelector(".np-current").textContent = "0:00";
                    }
                });

            activateBar(track, audio, null);

            if (isPlaying) {
                audio.play().catch(() => {
                    if (_bar) {
                            _bar.querySelector(".np-play-btn").innerHTML = ICON_PLAY;
                            _bar.querySelector(".np-play-btn").setAttribute("aria-label", "Play");
                        }
                        // Autoplay blocked (mobile); preserve original position
                    saveState(_activeTrackIndex, audio, false, currentTime);
                   });
               } else {
                   _bar.querySelector(".np-play-btn").innerHTML = ICON_PLAY;
                   _bar.querySelector(".np-play-btn").setAttribute("aria-label", "Play");
               }
           }
       }

     // -----------------------------------------------
     // RENDER — Build and inject the player
     // -----------------------------------------------

     // Detect touch device (hide volume controls on mobile)
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
     // Build and inject now-playing bar into document body
        _bar = buildNowPlayingBar(isTouchDevice);
    document.body.appendChild(_bar);

     // Render track groups only if a mount element exists on this page
    if (hasRoot) {
        const groups = groupTracks(tracks);

          // Hidden group container — cards exist in DOM for click-to-play but are not visible
        const hiddenContainer = document.createElement("div");
        hiddenContainer.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;";
        document.body.appendChild(hiddenContainer);

          // Render each group
        groups.forEach(group => {
            if (group.label === "hidden") {
                group.tracks.forEach(track => hiddenContainer.appendChild(buildPlayerCard(track)));
                return;
               }

              // Create group section with label
            const groupEl = document.createElement("div");
            groupEl.className = "audio-group";

            const label = document.createElement("p");
            label.className = "audio-group-label";
            label.textContent = group.label;
            groupEl.appendChild(label);

              // Create track grid for this group
            const grid = document.createElement("div");
            grid.className = "audio-grid";
            group.tracks.forEach(track => grid.appendChild(buildPlayerCard(track)));
            groupEl.appendChild(grid);
            root.appendChild(groupEl);
           });

          // Build visible card list for prev/next navigation (excludes hidden group)
           _visibleCards = [...root.querySelectorAll(".player-card")];

          // Render optional fallback link below the player
        if (fallback && fallback.url) {
            const p = document.createElement("p");
            p.className = "audio-fallback";
            p.innerHTML = `Audio not loading? <a href="${fallback.url}" target="_blank" rel="noopener">${fallback.text || 'Listen here'} →</a>`;
            root.parentNode.insertBefore(p, root.nextSibling);
           }
       }

     // Wire up any [data-play-title] elements on the page (e.g., social proof album art)
     // These elements act as triggers to start playback for a matching track.
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

          // Click handler: find matching card and trigger play
        wrapper.addEventListener("click", () => {
            const title = img.dataset.playTitle;
            const card = [...document.querySelectorAll(".player-card")]
                   .find(c => c.dataset.trackTitle === title);
            if (card) card.querySelector(".play-btn").click();
           });
      });

     // Wire up volume slider — applies to all audio elements
    const volSlider = document.getElementById("audio-volume-slider");
    const volPct      = document.getElementById("audio-volume-pct");

      /**
       * updateVolume() — Applies volume to all audio elements
       * 
       * Called whenever the volume slider changes. Updates:
       *     - All card audio elements
       *     - Active audio (for ghost play)
       *     - Volume percentage display
       *     - Slider gradient background (--vol-pct custom property)
       * 
       * @param {number} val — Volume value 0-100
       */
    function updateVolume(val) {
        const v = val / 100;
        document.querySelectorAll(".player-card").forEach(card => {
            if (card._audio) card._audio.volume = v;
           });
           // Also apply to any ghost audio element (not attached to a card)
        if (_activeAudio) _activeAudio.volume = v;
        if (volPct)    volPct.textContent = val + "%";
        if (volSlider) volSlider.style.setProperty("--vol-pct", val + "%");
       }

    if (volSlider) {
        volSlider.addEventListener("input", () => updateVolume(volSlider.value));
        updateVolume(volSlider.value);    // Apply default volume (80%) on load
       }

      // Volume popup toggle — show/hide slider on volume button click
    const volBtn = document.querySelector(".np-volume-btn");
    const volPopup = document.querySelector(".np-volume-popup");
    if (volBtn && volPopup) {
        volBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = volPopup.classList.toggle("open");
            volBtn.setAttribute("aria-pressed", String(isOpen));
           });
        document.addEventListener("click", () => {
            volPopup.classList.remove("open");
            if (volBtn) volBtn.setAttribute("aria-pressed", "false");
           });
        volPopup.addEventListener("click", e => e.stopPropagation());    // Prevent close on slider click
       }

      // Restore any saved playback state from a previous page
    restoreState();
}
