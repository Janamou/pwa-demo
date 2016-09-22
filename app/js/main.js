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
        this.refresh.addEventListener("click", function() {
            this.loadData();
        }.bind(this));

        this.spinner = document.querySelector(".mdl-spinner");
        this.url = "https://api.github.com/search/repositories?q=pwa&sort=stars";
    }

    App.prototype.init = function () {
        var first = localStorage.getItem("demo_loaded");

        // Hotfix. When the first fetch is so early, the data is not cached.
        if (!first) {
            setTimeout(function() {
                this.loadData();
            }.bind(this), 1000);
            localStorage.setItem("demo_loaded", true);
        } else {
            this.loadData();
        }
    };

    App.prototype.loadData = function () {
        //setTimeout(function() {
        this.spinner.classList.add("is-active");
        this.clearAll();

        var that = this;
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (this.status == 200) {
                    that.showData(JSON.parse(this.responseText));
                } else {
                    that.loadFromCache();
                }
            }
        };
        request.open("GET", this.url, true);
        request.send();
    };

    App.prototype.loadFromCache = function() {
        var that = this;
        
        if ("caches" in window) {
            caches.match(this.url).then(function(response) {
                if (response) {
                    response.json().then(function(json) {
                        that.showData(json);
                    });
                }
            });
        }
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
