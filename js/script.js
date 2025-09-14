let currentsong = new Audio();
let songs = [];
let currfolder;

function secondstominute(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingsec = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingsec).padStart(2, '0')}`;
}

// Load songs from folder's info.json
async function getsongs(folder) {
    currfolder = folder;
    const res = await fetch(`songs/${folder}/info.json`);
    const data = await res.json();
    songs = data.songs;

    const songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        const displayName = decodeURI(song).replaceAll("%20", " ");
        songUL.innerHTML += `
            <li>
                <img class="invert" src="img/vynil-02-stroke-rounded.svg" alt="music">
                <div class="info">
                    <div>${displayName}</div>
                    <div>Raza</div>
                </div>
                <div class="playnow">
                    <span>Play now</span>
                    <img src="img/play-circle-stroke-rounded.svg" alt="play">
                </div>
            </li>`;
    }

    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const track = e.querySelector(".info div").innerText.trim();
            playmusic(track);
        });
    });

    return songs;
}

const playmusic = (track, pause = false) => {
    currentsong.src = `songs/${currfolder}/${encodeURIComponent(track)}`;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Display albums using master albums.json
async function displayalbums() {
    const res = await fetch("albums.json");
    const albums = await res.json();
    const cardcontainer = document.querySelector(".cardcontainer");
    cardcontainer.innerHTML = "";

    for (const album of albums) {
        const infoRes = await fetch(album.info);
        const info = await infoRes.json();

        cardcontainer.innerHTML += `
            <div data-folder="${album.folder}" class="card">
                <div class="greenplay">
                    <img src="img/play.svg" alt="play">
                </div>
                <img src="${album.cover}" alt="cover">
                <h2>${info.title}</h2>
                <p>${info.description}</p>
            </div>`;
    }

 Array.from(cardcontainer.getElementsByClassName("card")).forEach(card => {
    card.addEventListener("click", async () => {
        songs = await getsongs(card.dataset.folder);
        if (songs.length > 0) {
            playmusic(songs[0]); // first song play ho jaye
        }
    });
});
}

// Main function
async function main() {
    await getsongs("Old is Gold"); // default album
    playmusic(songs[0], true);
    await displayalbums();

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/playm.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondstominute(currentsong.currentTime)}/${secondstominute(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

previous.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(currentsong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentTrack);
    if ((index - 1) >= 0) playmusic(songs[index - 1]);
});

next.addEventListener("click", () => {
    let currentTrack = decodeURIComponent(currentsong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentTrack);
    if ((index + 1) < songs.length) playmusic(songs[index + 1]);
});


    document.querySelector(".range input").addEventListener("change", e => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });
}

main();

// Hamburger menu
document.querySelector(".hamburger").addEventListener("click", () => {
    const side = document.querySelector(".firstbox");
    side.style.left = (window.getComputedStyle(side).left === "0px") ? "-100%" : "0";
});

document.querySelector(".cancel").addEventListener("click", () => {
    document.querySelector(".firstbox").style.left = "-100%";
});
