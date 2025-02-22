// The API Key
const myAPIKey = "58bbe2d10382465d81736a583252cd67";

userlat = 0;
userlng = 0;

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

    console.log(userlat, userlng);

    return userlat, userlng;
}

//console.log(userlat, userlng);
getLocation();

const reverseGeocodingUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${userlat}&lon=${userlng}&apiKey=${myAPIKey}`;

// call Reverse Geocoding API - https://www.geoapify.com/reverse-geocoding-api/
fetch(reverseGeocodingUrl).then(result => result.json())
.then(featureCollection => {
  if (featureCollection.features.length === 0) {
    console.log("Address Not Found");
    return;
  }

  const foundAddress = featureCollection.features[0];
  console.log(foundAddress.properties.city);
  console.log(foundAddress.properties.country);

});