console.log("lets write some javascript");

//declaring current song

let currentSong = new Audio();
let songs;
let currFolder;

//function to convert seconds to minutes and seconds
function convertSecondsToMMSS(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  // Round down the total seconds
  seconds = Math.floor(seconds);

  // Convert seconds to minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Format minutes and seconds with leading zeros
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;

  // Return formatted time string
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;

  //fetching songs from current folder
  let response = await fetch(`/${folder}/`);
  let text = await response.text();
  console.log(text);

  let div = document.createElement("div");
  div.innerHTML = text;

  let as = div.getElementsByTagName("a");
  console.log(as);

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      //pushing the songs from the current folder
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      ` <li>
      <img class="invert" src="img/music.svg" alt="" />
      <div class="info">
        <div>${song.replaceAll("%20", " ")} </div>
        <div>Haseeb </div>
      </div>
      <div class="playnow flex">
        <span>Play now</span>
        <img class="invert" src="img/play.svg" alt="" />
      </div>
      </li>`;
  }

  //Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
  //returning the url of songs
}

//function to play songs
const playMusic = (track, pause = false) => {
  // setting the current source of song to the current folder
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

//Displaying alubums by a function
async function displayAlbums() {
  let response = await fetch("/songs/");
  let text = await response.text();

  let div = document.createElement("div");
  div.innerHTML = text;
  let anchors = div.getElementsByTagName("a");

  //declaring cardContainer
  let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];

      //Get the metadata of the folder
      let response = await fetch(`/songs/${folder}/info.json`);
      let text = await response.json();

      //setting up the cards inside the container
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `  <div data-folder="${folder}" class="card">
      <div class="play">
        <img src="img/playbtn.svg" alt="" />
      </div>
      <img 
        src="/songs/${folder}/cover.jpeg"
        alt=""
      />
      <h4>${text.title}</h4>
      <p>${text.description}</p>
    </div>`;
    }
  }
  //Load the playlist whenever a card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log(item.target, item.currentTarget.dataset);
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  //Get the lists of all the songs
  await getSongs("songs/melodies");
  playMusic(songs[0], true);

  //Displaying albums in cardcontainer
  await displayAlbums();

  //Attach an event listener to previous, play and next buttons

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  //Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${convertSecondsToMMSS(
      currentSong.currentTime
    )}/${convertSecondsToMMSS(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  //Add event listener for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  //Add an event listener to previous next

  previous.addEventListener("click", () => {
    console.log("previous clicked");
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    console.log("next clicked");
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //Add an event listener to range for volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("setting volume to", e.target.value);
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("mute.svg", "volume.svg");
      } else {
        document.querySelector(".volume>img").src = document
          .querySelector(".volume>img")
          .src.replace("volume.svg", "mute.svg");
      }
    });

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
