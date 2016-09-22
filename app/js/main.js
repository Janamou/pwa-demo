(function () {
    "use strict";

    // Check to make sure service workers are supported in the current browser,
    // and that the current page is accessed from a secure origin.
    var isLocalhost = Boolean(window.location.hostname === "localhost" ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === "[::1]" ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    );

    if ("serviceWorker" in navigator &&
        (window.location.protocol === "https:" || isLocalhost)) {
        navigator.serviceWorker.register("./service-worker.js")
            .then(function (register) {
                //TODO something to do here
            }).catch(function (e) {
            console.error("Error during service worker registration:", e);
        });
    }

    function App() {
        this.container = document.getElementById("content");
        this.cardTemplate = document.getElementById("card-template");
        this.refresh = document.getElementById("refresh");
        this.refresh.addEventListener("click", e => {
            this.clearAll();
            this.loadData();
        });

        this.spinner = document.querySelector(".mdl-spinner");
    }

    App.prototype.init = function () {
        this.loadData();
    };

    App.prototype.loadData = function () {
        //setTimeout(function() {
        var url = "https://api.github.com/search/repositories?q=pwa&sort=stars";
        this.spinner.classList.add("is-active");

        var request = new Request(url);
        fetch(request).then(response => {
            response.json().then(json => {
                this.showData(json);
            });
        }).catch(e => {
            if ("caches" in window) {
                caches.match(url).then(response => {
                    if (response) {
                        response.json().then(json => {
                            this.showData(json);
                        });
                    }
                });
            }
        });
        //}, 1000);
    };

    App.prototype.showData = function (data) {
        var items = data.items;

        for (var i = 0; i < items.length; i++) {
            this.createCard(items[i]);
        }
        this.spinner.classList.remove("is-active");
    };

    App.prototype.createCard = function (item) {
        var card = this.cardTemplate.cloneNode(true);
        card.style.display = "block";

        var cardContent = card.querySelector(".mdl-card__supporting-text");
        cardContent.querySelector("h4").textContent = item.name;

        var textDescription = item.description;
        var cardDescription = cardContent.querySelector("p");
        if (textDescription) {
            cardDescription.innerText = item.description;
        } else {
            cardDescription.innerText = "No description available";
            cardDescription.classList.add("not-available");
        }

        var cardLink = card.querySelector(".mdl-card__actions");
        cardLink.querySelector("a").href = item.html_url;

        var cardStars = card.querySelector(".mdl-card__metadata-stars span");
        cardStars.textContent = item.stargazers_count;
        var cardWatchers = card.querySelector(".mdl-card__metadata-watchers span");
        cardWatchers.textContent = item.watchers_count;
        var cardForks = card.querySelector(".mdl-card__metadata-forks span");
        cardForks.textContent = item.forks_count;

        this.container.appendChild(card);
    };

    App.prototype.clearAll = function () {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    };

    window.onload = function () {
        var app = new App();
        app.init();
    };
})
();
