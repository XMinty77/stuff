let roundTitle;
let currentRound = 1;
let currentRoundElement = null;

passwordryanstr = "ryan";
passwordryani = 0;

passwordprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
passwordprimesi = 0;

copiedtoclipboardtesttimeout = NaN;

$(document).ready(() => {
});

$(window).on("load", () => {
    currentRoundElement = $("#footbar a.active");
    roundTitle = document.getElementById("title-matchup-round");

    $("a.copyuser").click(function() {
        navigator.clipboard.writeText($(this).attr("data"));
        $("#toast").addClass("active")
        clearTimeout(copiedtoclipboardtesttimeout);
        copiedtoclipboardtesttimeout = setTimeout(() => {
            $("#toast").removeClass("active");
        }, 2500);
    });

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

x = '<span onclick="registerryan(\'r\')"';

function registerryan(chr) {
    if (chr == passwordryanstr[passwordryani]) {
        passwordryani++;
        if (passwordryani == passwordryanstr.length) {
            passwordryani = Number.NEGATIVE_INFINITY;
            $("img").attr("src", "pfps/Ryan.png");
            window.open("https://imgur.com/a/k4dSdOt", "_blank");
        }
    } else passwordryani = 0;
}

function registerprimes(num) {
    if (num == passwordprimes[passwordprimesi]) {
        passwordprimesi++;
        if (passwordprimesi == passwordprimes.length) {
            passwordprimesi = Number.NEGATIVE_INFINITY;
            window.open("https://www.youtube.com/watch?v=yyHzXkHXgyY", "_blank");
        }
    } else passwordprimesi = 0;
}