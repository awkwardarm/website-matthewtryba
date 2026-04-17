// ===============================================
// TRACK CONFIG — edit here to update all pages
// ===============================================
// Each track needs: group, title, artist, src, artwork
// group  → section heading (tracks with the same group string are grouped together)
// src    → path relative to CDN_BASE (defined in shared-scripts.js)
// artwork → path relative to CDN_BASE (optional)

const TRACKS = [
    // Group 1: Major Label Engineering Credits
    {
        group: "For Major Labels: Engineering",
        title: "Counting Stars",
        artist: "OneRepublic",
        src: CDN_BASE + "audio/Counting%20Stars%20-%20OneRepublic%20-%20TRYBA%20MUSIC.mp3",
        artwork: CDN_BASE + "images/1R%20Native.jpg"
    },
    {
        group: "For Major Labels: Engineering",
        title: "I Know Places",
        artist: "Taylor Swift",
        src: CDN_BASE + "audio/I%20Know%20Places%20-%20Taylor%20Swift%20-%20TRYBA%20MUSIC.mp3",
        artwork: CDN_BASE + "images/Taylor%20Swift%201989.jpg"
    },
    {
        group: "For Major Labels: Engineering",
        title: "Why Try",
        artist: "Ariana Grande",
        src: CDN_BASE + "audio/Why%20Try%20-%20Ariana%20Grande%20-%20TRYBA%20MUSIC.mp3",
        artwork: CDN_BASE + "images/Arana%20Grande%20My%20Everything.jpg"
    },
    {
        group: "For Major Labels: Engineering",
        title: "Remedy",
        artist: "Adele",
        src: CDN_BASE + "audio/Remedy%20-%20Adele.mp3",
        artwork: CDN_BASE + "images/Adele%2025.jpg"
    },

    // Hidden group — playable via album art click but not shown in the player grid
    {
        group: "hidden",
        title: "Maps",
        artist: "Maroon 5",
        src: CDN_BASE + "audio/Maps%20-%20Maroon%205%20-%20TRYBA%20MUSIC.mp3",
        artwork: CDN_BASE + "images/Maroon%205%20V.jpg"
    },
    {
        group: "hidden",
        title: "Burn",
        artist: "Ellie Goulding",
        src: CDN_BASE + "audio/Burn%20-%20Ellie%20Goulding.mp3",
        artwork: CDN_BASE + "images/burn-ellie-goulding.jpg"
    },

    // Group 2: Full Production for Independent Artists
    {
        group: "For Independent Artists: Production, Songwriting, & Mixing",
        title: "Down With Me",
        artist: "yorxe",
        src: CDN_BASE + "audio/Down%20With%20Me%20-%20Yorxe%20-%20TRYBA%20MUSIC.mp3",
        artwork: CDN_BASE + "images/Down%20WIth%20Me.jpg"
    },
    {
        group: "For Independent Artists: Production, Songwriting, & Mixing",
        title: "Fearless",
        artist: "Maia Moham",
        src: CDN_BASE + "audio/Fearless%20-%20Maia%20Moham%20-%20TRYBA%20MUSIC.mp3",
        artwork: CDN_BASE + "images/fearless.jpeg"
    }
];
