/*
 * Webaudio via promise based api
 */

// XHR via promise
function makeRequest (method, url) {
  return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.responseType = "arraybuffer";
            xhr.onload = function () {
              if (this.status >= 200 && this.status < 300) {
                
                resolve(xhr.response);                              
              } else {
                reject({
                  status: this.status,
                  statusText: xhr.statusText                              
                });      
              }
            };
            xhr.onerror = function () {
              reject({
                status: this.status,
                statusText: xhr.statusText                        
              });
            };
            xhr.send();      
  });
}

/*
class SoundSample {
  constructor(soundID) {
    this._id = soundID;
    this._buffer = null;
  }
  get SoundID() {
    return this._id;
  }
  get Buffer() {
    return this._buffer;
  }

}

class PlayingSound {
  constructor(webaudio, id) {
    this._webaudio = webaudio;
    this._id = id;
    // _source is a buffer of audio data created via audioCtx.createBufferSource();
    this._source;
  }

  Play() {
    this._source.start(0);
  }

  Stop() {
    this._source.stop();
  }
}
*/

class PlayingSound {
  constructor(system, url, id) {
    this._system = system;
    this._url = url;
    this._id = id;
  }
};

class SoundSamples {
  constructor(system, url, id) {
    this._system = system;
    this._url = url;
    this._id = id;
  }


};


function asyncLoad(url) {
  
  console.log("initiating asyncLoad on url ", url);
  
  return makeRequest("GET", url);
    //.then(
    //  function(rawData) {
    //    sound._system._rawData[sound._samplesID] = rawData;
    //    return sound;
    //  }
    //);
}



function asyncDecode(rawData) {
  
  console.log("initiating asyncDecode on sound on rawdata...");

  return sys._audioCtx.decodeAudioData(rawData).then(
      function(value) {
        console.log("successfully completed our audio decoding.");
      }
  );
  //return sound._system._audioCtx.decodeAudioData(rawData);
      //.then( function(decodedAudioData) {
      //  soundSystem._decodedAudioData[sound._samplesID] = decodedAudioData;
      //  return sound; 
      //}
  //);
}




/*
asyncPlay(sound) {
  return new Promise(function(resolve, reject) {
    if(!sound._samplesID in sound._system._decodedAudioData) {
      console.error("SoundID ", sound._samplesID, " is not a valid sound sample.");
      reject();
    }
    sound._source = sound._system._audioCtx.createBufferSource();
    sound._source.buffer = sound._system._decodedAudioData[sound._sampleID];
    sound._source.start(0);
    resolve(sound);
  });
}



function asyncPause(soundSystem, sound) {
  
}

function asyncUnpause(soundSystem, sound) {

}

function asyncMute(soundSystem, sound) {
  
}

function asyncSetVolume(soundSystem, sound) {

}

*/

class SoundSystem {
  constructor() {
    this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(!this._audioCtx) {
      console.error("Failed to create proper web audio context.");
      return;
    }
    // dictionary of sound samples data so multiple playing sounds can run off the same
    // decoded audio data.
    this._soundSamples = {};

    // Objects representing actually playing sounds.
    this._playingSounds = {};
    
    // an outstanding promise for some async action going on
    this._promise = null;
  }

  //do(nextPromise) {
  //  if(this._promise) {
  //    this._promise.then(nextPromise);
  //  }else{
  //    this._promise = nextPromise;
  //  } 
  //}

  // Loads and decodes sound from a single url
  // can complete asynchronously in the future.
  // Returns a soundSampleID that can be used to play those samples in a sound
  // at some point in the future;
  load(url) {
    //if(url in this._soundSamples) {
    //  return this._soundSamples[url];
    //}
    // initiate an async fetch and decode of sound data
    asyncLoad(url)
      .then(asyncDecode);
  }

}

var sys = new SoundSystem();

sys.load("bear.mp3");



