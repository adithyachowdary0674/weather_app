const cityInput =
    document.getElementById("cityInput");

const searchButton =
    document.getElementById("searchButton");

const weatherContainer =
    document.getElementById(
        "weatherContainer"
    );

const errorMessage =
    document.getElementById(
        "errorMessage"
    );


// --------------------------------
// GET WEATHER
// --------------------------------

async function getWeather(city) {

    try {

        // Clear old error

        errorMessage.textContent = "";


        // Show loading

        searchButton.disabled = true;

        searchButton.textContent =
            "Loading...";


        // API request

        const response =
            await fetch(
                `/api/weather?city=${encodeURIComponent(city)}`
            );


        // Convert response to JSON

        const data =
            await response.json();


        // Check HTTP status

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to get weather"
            );

        }


        // Display data

        displayWeather(data);


    } catch (error) {

        weatherContainer
            .classList
            .add("hidden");


        errorMessage.textContent =
            error.message;


    } finally {

        searchButton.disabled =
            false;

        searchButton.textContent =
            "Search";

    }

}


// --------------------------------
// DISPLAY WEATHER
// --------------------------------

function displayWeather(data) {

    weatherContainer
        .classList
        .remove("hidden");


    // Location

    document.getElementById(
        "locationName"
    ).textContent =
        data.location.name;


    document.getElementById(
        "locationCountry"
    ).textContent =

        `${data.location.state || ""} ${
            data.location.country
        }`;


    // Temperature

    document.getElementById(
        "temperature"
    ).textContent =

        Math.round(
            data.current.temperature
        );


    // Feels like

    document.getElementById(
        "feelsLike"
    ).textContent =

        Math.round(
            data.current.feelsLike
        );


    // Condition

    document.getElementById(
        "condition"
    ).textContent =

        data.current.description;


    // Icon

    document.getElementById(
        "weatherIcon"
    ).src =

        `https://openweathermap.org/img/wn/${
            data.current.icon
        }@2x.png`;


    // Humidity

    document.getElementById(
        "humidity"
    ).textContent =

        `${data.current.humidity}%`;


    // Wind

    document.getElementById(
        "wind"
    ).textContent =

        `${data.current.windSpeed} m/s`;


    // Pressure

    document.getElementById(
        "pressure"
    ).textContent =

        `${data.current.pressure} hPa`;


    // Visibility

    document.getElementById(
        "visibility"
    ).textContent =

        `${(
            data.current.visibility / 1000
        ).toFixed(1)} km`;


    // Forecast

    displayForecast(
        data.forecast
    );

}


// --------------------------------
// FORECAST
// --------------------------------

function displayForecast(forecast) {

    const container =
        document.getElementById(
            "forecastContainer"
        );


    container.innerHTML = "";


    const daily = [];

    const dates = new Set();


    for (
        const item of forecast
    ) {

        const date =
            new Date(
                item.timestamp * 1000
            );


        const dateString =
            date.toLocaleDateString();


        if (
            !dates.has(dateString)
        ) {

            dates.add(dateString);

            daily.push(item);

        }


        if (
            daily.length >= 5
        ) {

            break;

        }

    }


    daily.forEach(item => {

        const date =
            new Date(
                item.timestamp * 1000
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "forecast-card";


        card.innerHTML = `

            <p>
                ${
                    date.toLocaleDateString(
                        undefined,
                        {
                            weekday: "short"
                        }
                    )
                }
            </p>

            <img
                src="https://openweathermap.org/img/wn/${
                    item.icon
                }@2x.png"

                alt="${item.description}"
            >

            <h3>
                ${Math.round(
                    item.temperature
                )}°C
            </h3>

            <p>
                ${item.description}
            </p>

            <small>
                Wind:
                ${item.windSpeed}
                m/s
            </small>

        `;


        container.appendChild(
            card
        );

    });

}


// --------------------------------
// SEARCH BUTTON
// --------------------------------

searchButton.addEventListener(
    "click",
    () => {

        const city =
            cityInput.value.trim();


        if (!city) {

            errorMessage.textContent =
                "Please enter a city name.";

            return;

        }


        getWeather(city);

    }
);


// --------------------------------
// ENTER KEY
// --------------------------------

cityInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            searchButton.click();

        }

    }
);