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
        return value;
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
    this._samples = {};

    // Objects representing actually playing sounds.
    this._playingSounds = {};
    
    // an outstanding promise for some async action going on
    this._promise = null;
    
    this._nextSamplesID = 1;
    this._nextSoundID = 1;
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

    var that = this;
    var id = that._nextSamplesID;
    that._nextSamplesID++;
  
    that._promise = asyncLoad(url)
      .then(asyncDecode)
      .then(function(data)
      {
        that._samples[id] = data;
      })
      .then(function(value) {
        that._promise = null;
      });

   return id;
  }

  play(samplesID) {

    var that = this;

    if(!samplesID in that._samples)
    {
      console.error("no samplesid in _samples.");
      return;
    }

    if(that._promise)
    {
      console.log("pending operations so initiating an async play...");

      that._promise.then(function(){
        that._source = that._audioCtx.createBufferSource();
        that._source.buffer = that._samples[samplesID];
        that._source.connect(that._audioCtx.destination);
        that._source.start(0);
      });
    }else{
      console.log("no pending operations so doing a synchronous play.");

      that._source = that._audioCtx.createBufferSource();
      that._source.buffer = that._samples[samplesID];
      that._source.connect(that._audioCtx.destination);
      that._source.start(0);
    }
    
    var id = this._nextSoundID;
    this._nextSoundID++;

    return id;
  }

}

var sys = new SoundSystem();

var samplesID = sys.load("bear.mp3");
var soundID = sys.play(samplesID);
// sys.stop(soundID);
// sys.free(samplesID);


