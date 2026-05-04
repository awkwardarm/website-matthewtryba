/**
 * ============================================================
 * TRACK CONFIGURATION — Audio Player Data Source
 * ============================================================
 * 
 * PURPOSE:
 *     This file defines the TRACKS array, which is the single
 *     source of truth for all audio player content. Editing this
 *     array updates tracks across all pages that import it.
 * 
 * HOW IT WORKS:
 *     Each track object represents one song with the following fields:
 *         - group    : Section heading label (tracks with same group are grouped)
 *         - title    : Song title displayed in the player
 *         - artist   : Artist name displayed below the title
 *         - src      : URL path to the MP3 audio file
 *         - artwork  : URL path to the album cover image (optional)
 * 
 *     The `group` field controls section organization:
 *         - Any group name creates a section header in the player
 *         - Use group: "hidden" for tracks playable via direct links
 *           but NOT shown in the main player grid
 * 
 * CDN BASE URL:
 *     All src and artwork paths are prefixed with CDN_BASE
 *     (defined in shared-scripts.js line 6).
 *     Format: https://pub-869789a451fa44dbadf9e27cd445afa0.r2.dev/
 * 
 * USAGE:
 *     This file is imported via <script src="./audio-player-tracks.js">
 *     The TRACKS constant is then passed to initAudioPlayer({ tracks: TRACKS })
 * ============================================================
 */

// ===============================================
// TRACK CONFIG — edit here to update all pages
// ===============================================
// Each track needs: group, title, artist, src, artwork
// group   → section heading (tracks with the same group string are grouped together)
// src     → path relative to CDN_BASE (defined in shared-scripts.js)
// artwork → path relative to CDN_BASE (optional)

const TRACKS = [
    // ------------------------------------------------
    // GROUP 1: "For Major Labels: Engineering"
    // ------------------------------------------------
    // These tracks showcase engineering work done for
    // major label artists. They appear in a section
    // with this heading in the audio player.
    // ------------------------------------------------

    // Track 1: "Counting Stars" by OneRepublic
    //   Album: 1R Native (self-titled album)
    //   Artwork: 1R Native.jpg
    {
        group: "For Major Labels: Engineering",
        title: "Counting Stars",
        artist: "OneRepublic",
        src: CDN_BASE + "audio/Counting%20Stars%20-%20OneRepublic%20-%20TRYBA%20MUSIC.mp3",
        artwork: CDN_BASE + "images/album-art/1R%20Native.jpg"
    },

    // Track 2: "I Know Places" by Taylor Swift
    //   Album: 1989 (Taylor's version era)
    //   Artwork: Taylor Swift 1989.jpg
    {
        group: "For Major Labels: Engineering",
        title: "I Know Places",
        artist: "Taylor Swift",
        src: CDN_BASE + "audio/I%20Know%20Places%20-%20Taylor%20Swift%20-%20TRYBA%20MUSIC.mp3",
        artwork: CDN_BASE + "images/album-art/Taylor%20Swift%201989.jpg"
    },

    // Track 3: "Why Try" by Ariana Grande
    //   Album: My Everything
    //   Artwork: Arana Grande My Everything.jpg
    {
        group: "For Major Labels: Engineering",
        title: "Why Try",
        artist: "Ariana Grande",
        src: CDN_BASE + "audio/Why%20Try%20-%20Ariana%20Grande%20-%20TRYBA%20MUSIC.mp3",
        artwork: CDN_BASE + "images/album-art/Arana%20Grande%20My%20Everything.jpg"
    },

    // Track 4: "Remedy" by Adele
    //   Album: 25
    //   Artwork: Adele 25.jpg
    {
        group: "For Major Labels: Engineering",
        title: "Remedy",
        artist: "Adele",
        src: CDN_BASE + "audio/Remedy%20-%20Adele.mp3",
        artwork: CDN_BASE + "images/album-art/Adele%2025.jpg"
    },

    // ------------------------------------------------
    // HIDDEN GROUP — Not displayed in player grid
    // ------------------------------------------------
    // Tracks in this group are NOT shown in the main
    // player grid but CAN be played via direct links
    // (e.g., social proof album art clicks, prev/next
    // navigation from other pages).
    // 
    // Use this for bonus tracks, demos, or exclusive
    // content you want accessible but not prominent.
    // ------------------------------------------------

    // Hidden Track 1: "Maps" by Maroon 5
    //   Album: V
    //   Artwork: Maroon 5 V.jpg
    {
        group: "hidden",
        title: "Maps",
        artist: "Maroon 5",
        src: CDN_BASE + "audio/Maps%20-%20Maroon%205%20-%20TRYBA%20MUSIC.mp3",
        artwork: CDN_BASE + "images/album-art/Maroon%205%20V.jpg"
    },

    // Hidden Track 2: "Burn" by Ellie Goulding
    //   Artwork: burn-ellie-goulding.jpg
    {
        group: "hidden",
        title: "Burn",
        artist: "Ellie Goulding",
        src: CDN_BASE + "audio/Burn%20-%20Ellie%20Goulding.mp3",
        artwork: CDN_BASE + "images/album-art/burn-ellie-goulding.jpg"
    },

    // ------------------------------------------------
    // GROUP 2: "For Independent Artists: Production, Songwriting, & Mixing"
    // ------------------------------------------------
    // These tracks showcase full production, songwriting,
    // and mixing work done for independent artists.
    // ------------------------------------------------

    // Track 5: "Down With Me" by Yorxe
    //   Artwork: Down WIth Me.jpg
    {
        group: "For Independent Artists: Production, Songwriting, & Mixing",
        title: "Down With Me",
        artist: "yorxe",
        src: CDN_BASE + "audio/Down%20With%20Me%20-%20Yorxe%20-%20TRYBA%20MUSIC.mp3",
        artwork: CDN_BASE + "images/album-art/Down%20WIth%20Me.jpg"
    },

    // Track 6: "Fearless" by Maia Moham
    //   Artwork: fearless.jpeg
    {
        group: "For Independent Artists: Production, Songwriting, & Mixing",
        title: "Fearless",
        artist: "Maia Moham",
        src: CDN_BASE + "audio/Fearless%20-%20Maia%20Moham%20-%20TRYBA%20MUSIC.mp3",
        artwork: CDN_BASE + "images/album-art/fearless.jpeg"
    }
];
