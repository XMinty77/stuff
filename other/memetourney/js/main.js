let roundTitle;
let currentRound = 1;
let currentRoundElement = null;

$(document).ready(() => {
});

$(window).on("load", () => {
    currentRoundElement = $("#footbar a.active");
    roundTitle = document.getElementById("title-matchup-round");

    $("#m1").addClass("active");
    let round = Number(location.hash.substring(1)) || 1;
    changeround($("#footbar").get(0).children[round - 1], round);
    $("#past-show-loader").toggleClass("hidden");
})

function changeround(elem, newRound) {
    if (currentRound == newRound) return;
    elem = $(elem);

    currentRoundElement.toggleClass("active");
    elem.toggleClass("active");

    $("#m" + currentRound).toggleClass("active");
    $("#m" + newRound).toggleClass("active");

    currentRound = newRound;
    currentRoundElement = elem;
    roundTitle.innerText = newRound;
}