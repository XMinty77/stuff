let currentRound = 1;
let currentRoundElement = null;

$(window).load(() => {
    currentRoundElement = $("#footbar a.active");
    $("#past-show-loader").toggleClass("hidden");
});

function changeround(elem, newRound) {
    if (currentRound == newRound) return;
    elem = $(elem);

    currentRoundElement.toggleClass("active");
    elem.toggleClass("active");

    $("#m" + currentRound).toggleClass("active");
    $("#m" + newRound).toggleClass("active");

    currentRound = newRound;
    currentRoundElement = elem;
}