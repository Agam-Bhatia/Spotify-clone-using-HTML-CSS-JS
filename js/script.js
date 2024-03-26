console.log('Lets write JavaScript');
let currentSong = new Audio();
let currFolder;
let songs;

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Adding song list in the library
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        // When creating a song file, name it as {songName - songArtists}
        let songInitial = song.replaceAll("%20", " ").split(".")[0];
        let songName = songInitial.split(" - ")[0];
        let songArtist = songInitial.split(" - ")[1];
        songUL.innerHTML = songUL.innerHTML + 
        `<li> 
            <img class="invert" src="img/music.svg" alt="music logo">
            <div class="songInfo">
                <div>${songName}</div>
                <div>${songArtist}</div>
            </div>
            <img src="img/playNow.svg" alt="play svg">
        </li>`;
    }
    
    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener('click', element =>{
            console.log(e.querySelector(".songInfo").firstElementChild.innerText + " - " + e.querySelector(".songInfo").lastElementChild.innerText);
            playMusic(e.querySelector(".songInfo").firstElementChild.innerText + " - " + e.querySelector(".songInfo").lastElementChild.innerText);
        })
    })
    
}

function secondsToMinutesSeconds(seconds) {
    // Calculate minutes and seconds
    if(isNaN(seconds) || seconds<0){
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    // Add leading zeros if necessary
    let formattedMinutes = (minutes < 10) ? '0' + minutes : minutes;
    let formattedSeconds = (remainingSeconds < 10) ? '0' + remainingSeconds : remainingSeconds;

    // Concatenate minutes and seconds with ':'
    let formattedTime = formattedMinutes + ':' + formattedSeconds;

    return formattedTime;
}

const playMusic = (track, pause=false) => {
    currentSong.src = `/${currFolder}/` + track + ".mp3";
    if(!pause){
        currentSong.play();
        playButton.src="img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML= decodeURI(track);
    
    // Added loadedmetadata event listener so that current song duration can be seen when website is reloaded
    if(pause){
        currentSong.addEventListener("loadedmetadata", ()=>{
            document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        })
    }
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a');
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes('/songs/')){
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + 
            `<div data-folder="${folder}" class="card">
                <div class="play">
                    <svg width="40px" height="40px" viewBox="-10.8 -10.8 45.60 45.60" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-10.8" y="-10.8" width="45.60" height="45.60" rx="22.8" fill="#1FDF64" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M8.286 3.407A1.5 1.5 0 0 0 6 4.684v14.632a1.5 1.5 0 0 0 2.286 1.277l11.888-7.316a1.5 1.5 0 0 0 0-2.555L8.286 3.407z" fill="#000000"></path></g></svg>
                </div>            
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h3>${response.title}</h3>
                <p>${response.description}</p>
            </div>`;
        }
    }


    // Add an event listener to card
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(decodeURI(songs[0].split(".mp3")[0]))
        })
    })
}

async function main(){

    // get the list of all the songs
    await getSongs("songs/summer-mix");
    console.log(songs);
    playMusic(songs[0].split(".mp3")[0], true);

    // Display all the albums on the page
    await displayAlbums();

    // Attach an event listener to play, next and previous button
    
    // since play.svg was having an id = playButton, we can directly use it in js as
    playButton.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play();
            playButton.src="img/pause.svg";
        }
        else{
            currentSong.pause();
            playButton.src="img/play.svg";
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar 
    document.querySelector(".seekbar").addEventListener("click", (e)=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })

    // Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listener to close
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-100%";
    })

    // Add an event listener to previous and next buttons
    previousButton.addEventListener("click", ()=>{
        console.log("Previous button clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(currentSong.currentTime < 5){
            if(index-1 >= 0){
                playMusic(songs[index-1].split(".mp3")[0]);
            }
        }
        currentSong.currentTime = 0;
    })

    nextButton.addEventListener("click", ()=>{
        console.log("Next button clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if(index+1 < songs.length){
            playMusic(songs[index+1].split(".mp3")[0]);
        }
    })

    // Add an event listener to volume button
    document.querySelector(".songVolume").addEventListener("click", ()=>{
        if(currentSong.muted == false){
            document.querySelector(".songVolume").innerHTML = `<img src="img/mute.svg" alt="mute logo">`;
            currentSong.muted = true;
        }
        else{
            document.querySelector(".songVolume").innerHTML = `<img src="img/volume.svg" alt="volume logo">`;
            currentSong.muted = false;
        }
    })

    
}
main();