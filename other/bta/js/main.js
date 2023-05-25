const videoData = {
    "winter22_diamond": "QW8UZw9yl9U",
    "winter22_ruby": "T4CWOIUbGxw",
    "winter22_sapphire": "kkSF1eZu9z8",
    "autumn22_lunar": "DiGJaCSfpJU",
    "autumn22_cracked": "dLBIKublxWw",
    "autumn22_yellow": "yxrHdbsAyFA",
    "autumn22_red": "-X6DwpO-T4Q",
    "autumn22_blue": "XHXm0VDFSsI",
    "summer22_lunar": "TUlgYgpNMNs",
    "summer22_cracked": "7-VExYaulw4",
    "summer22_yellow": "QFIdn3ICVM8",
    "summer22_red": "N5lfHHb4QyQ",
    "summer22_blue": "qpqHWc_rvto",
    "spring22_cracked": "QnsFXOWXBoQ",
    "spring22_yellow": "4EjyhRBB6kg",
    "spring22_red": "bMhYy8sqW9Q",
    "spring22_blue": "nC4BYNgvw8k"
};
const videoStart = "https://www.youtube.com/embed/";

var I = 0;

$(document).ready(function(){
    $('.tabs').tabs();
    $('.collapsible').collapsible();

    let show = $("#past-show");
    let showi = $("#past-show iframe").get(0);
    let iloader = $("#past-show-loader");
    let root = document.getElementById("root-grid");
    let sections = new Array(...root.children);
    let navs = $("nav li").get();
    let navbar = $("#navbar");
    let sec = $(root);

    root.addEventListener("scroll", () => {
        let scroll = root.scrollTop + navbar.height();
        let i;
        let h = sec.height() / 2;
        for (i = 0; i < sections.length; i++) {
            if (scroll < sections[i].offsetTop + h) {
                break;
            }
        }

        if (I == i) return;
        I = i;
        
        $(navs[i]).addClass("active");
        for (let k = 0; k < navs.length; k++) {
            if (k != i) $(navs[k]).removeClass("active");
        }

        if (i != 3) show.removeClass("active");
    });

    $("#past span.shower").click(function () {
        show.removeClass("active");
        setTimeout(() => {
            let url = videoStart + videoData[$(this).attr("data")];
            showi.onload = () => {
                iloader.addClass("hidden");
            };
            iloader.removeClass("hidden");
            showi.src = url;
            show.addClass("active");
        }, 500);
    });
});