let currentsong = new Audio();
let songs;
let currfolder;
function secondstominute(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingsec = Math.floor(seconds % 60);
    const formattedmin = String(minutes).padStart(2, '0');
    const formattedsec = String(remainingsec).padStart(2, '0');
    return `${formattedmin}:${formattedsec}`;
}


async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = " "
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/vynil-02-stroke-rounded.svg" alt="music">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Raza</div>
                            </div>
                            <div class="playnow">
                            <span>Play now</span>
                                <img src="img/play-circle-stroke-rounded.svg" alt="play">
                            </div>
                            </li>`;
    }
     Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}

const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayalbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
        for(let index = 0; index < array.length; index++){
        const e = array[index];
        
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div 
            data-folder="${folder}" class="card">
                    <div class="greenplay">
                        <img src="img/play.svg" alt="play">
                    </div>
               <img src="/songs/${folder}/cover.jpg" alt="cover">
               <h2>${response.title}</h2>
               <p>${response.description}</p>
               </div>`
        }
    }
     Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`) 
            playmusic(songs[0]) 
        })
    })
}
async function main() {
    await getsongs("songs/English");
    playmusic(songs[0], true)

    await displayalbums()

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause();
            play.src = "img/playm.svg"
        }
    })
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondstominute(currentsong.currentTime)}/${secondstominute(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";

    })
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;

    })
    previous.addEventListener("click", () => {
        console.log("previous cliked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
    })
    next.addEventListener("click", () => {
        console.log("Next cliked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    })
}
main();

document.querySelector(".hamburger").addEventListener("click", () => {
    const side = document.querySelector(".firstbox");
    const currentleft = window.getComputedStyle(side).left;

    if (currentleft === "0px") {
        side.style.left = "-100%"
    }
    else {
        side.style.left = "0";
    }
})

document.querySelector(".cancel").addEventListener("click", () => {
    document.querySelector(".firstbox").style.left = "-100%";
})


