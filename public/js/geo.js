// The API Key
const myAPIKey = "58bbe2d10382465d81736a583252cd67";

function getLocation(){
    if (navigator.geolocation){
        navigator.geolocation.getCurrentPosition(appPosition);
    } else {
        console.log("Geolocation not supported");
    }
}
function appPosition(position){
    userlat = position.coords.latitude;
    userlng = position.coords.longitude;

    const reverseGeocodingUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${userlat}&lon=${userlng}&apiKey=${myAPIKey}`;

    // call Reverse Geocoding API - https://www.geoapify.com/reverse-geocoding-api/
    fetch(reverseGeocodingUrl).then(result => result.json())
    .then(featureCollection => {
    if (featureCollection.features.length === 0) {
        console.log("Address Not Found");
        return;
    }

    const foundAddress = featureCollection.features[0];
    //console.log(foundAddress.properties.city);        //Shows City
    //console.log(foundAddress.properties.country);     //Shows Country

    locationName = foundAddress.properties.city + " , " + foundAddress.properties.country;
    console.log(locationName);

    document.getElementById('formLocation').value = location;

    });

}

//console.log(userlat, userlng);
window.onload = getLocation();
console.log(userlat, userlng);
console.log(location)

