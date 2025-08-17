const audioPlayer = document.getElementById('audioPlayer');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const progressBar = document.getElementById('progressBar');
const volumeControl = document.getElementById('volumeControl');

const playlist = [
    { title: "You & I", artist: "One Direction", src: "One Direction - You & I.mp3", duration: 245 }, // 4:05 in seconds
    { title: "Golden", artist: "Harry Styles", src: "Harry Styles - Golden (Official Audio).mp3", duration: 211 }, // 3:31 in seconds
    { title: "To All The Girls I've Loved Before", artist: "Julio Iglesias", src: "JULIO IGLESIAS -TO ALL THE GIRLS I'VE LOVED BEFORE.mp3", duration: 211 } // 3:31 in seconds
];
let currentSongIndex = 0;

function loadSong(index) {
    currentSongIndex = index;
    const song = playlist[index];
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    audioPlayer.src = song.src;
    audioPlayer.load();
    audioPlayer.onloadedmetadata = function() {
        progressBar.max = audioPlayer.duration;
        durationDisplay.textContent = formatTime(audioPlayer.duration);
    };
    audioPlayer.play().catch(error => console.log("Playback failed:", error));
}

function playPause() {
    const playBtn = document.querySelector('.play-btn');
    if (audioPlayer.paused) {
        audioPlayer.play().then(() => {
            playBtn.textContent = '⏸';
        }).catch(error => console.log("Play error:", error));
    } else {
        audioPlayer.pause();
        playBtn.textContent = '▶';
    }
}

function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
}

function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
}

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

audioPlayer.addEventListener('timeupdate', () => {
    progressBar.value = audioPlayer.currentTime;
    currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
});

progressBar.addEventListener('input', () => {
    audioPlayer.currentTime = progressBar.value;
});

volumeControl.addEventListener('input', () => {
    audioPlayer.volume = volumeControl.value;
});

audioPlayer.addEventListener('loadedmetadata', () => {
    durationDisplay.textContent = formatTime(audioPlayer.duration);
});

audioPlayer.addEventListener('ended', nextSong);

loadSong(currentSongIndex); 