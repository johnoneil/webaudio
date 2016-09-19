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

class Sound {
  constructor(system, id, samplesID) {
    this._id = id;
    this._samplesID = samplesID;
    this._source = null;
    this._system = system;
  };

  play() {
    console.log("Doing delayed play of data with samplesID ", samplesID);

    this._source = this._system._audioCtx.createBufferSource();
    var samples = this._system._samples[this._samplesID];
    this._source.buffer = samples._data;
    this._source.connect(this._system._audioCtx.destination);
    this._source.start(0);
  }
  stop() {
    console.log("stopping sound with id: ", this._id);
    this._source.stop(0);
  }

};

class Samples {
  constructor(url, id) {
    this._url = url;
    this._id = id;
    this._data = null;

    this._promise = null;
  }
};


function asyncLoad(url) {
  
  console.log("initiating asyncLoad on url ", url);
  
  return makeRequest("GET", url);
}



function asyncDecode(rawData) {
  
  console.log("initiating asyncDecode on sound on rawdata...");

  return sys._audioCtx.decodeAudioData(rawData).then(
      function(value) {
        console.log("successfully completed our audio decoding.");
        return value;
      }
  );
}



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
    this._sounds = {};
    
    // an outstanding promise for some async action going on
    this._promise = null;
    
    this._nextSamplesID = 1;
    this._nextSoundID = 1;
  }

  // Loads and decodes sound from a single url
  // can complete asynchronously in the future.
  // Returns a soundSampleID this can be used to play those samples in a sound
  // at some point in the future;
  load(url) {

    var that = this;
    var id = this._nextSamplesID;
    this._nextSamplesID++;

    var samples = new Samples(url, id);
  
    samples._promise = asyncLoad(url)
      .then(asyncDecode)
      .then(function(data)
      {
        samples._data = data;
      })
      .then(function(value) {
        samples._promise = null;
      });

    this._samples[id] = samples;

   return id;
  }

  _do(system, samplesID, soundID, f) {
    console.log("_do ", samplesID, " ", soundID);

    var samples = system._samples[samplesID];
    var sound = system._sounds[soundID];
    if(samples._promise) {
      samples._promise.then(function(){
        f();
      });
    }else{
      f();
    }
  }

  play(samplesID) {

    var that = this;
    
    if(!samplesID in this._samples)
    {
      console.error("no samples id in _samples.");
      return;
    }
    
    var id = this._nextSoundID;
    this._nextSoundID++;

    var samples = this._samples[samplesID];
    var sound = new Sound(this, id, samplesID);
    this._sounds[id] = sound;
    
    this._do(this, samplesID, id, function(){sound.play();});

    return id;
  }

  stop(soundID) {
    if(!soundID in this._sounds) {
      console.error("Can't play sound with id ", soundID);
      return;
    }
    var sound = this._sounds[soundID];
    var samplesID = sound._samplesID;
    this._do(this, samplesID, soundID, function(){sound.stop();});
  }

}

var sys = new SoundSystem();

var samplesID = sys.load("bear.mp3");
var soundID = sys.play(samplesID);
window.setTimeout(function(){sys.stop(soundID);}, 500);
window.setTimeout(function(){sys.free(samplesID);}, 2000);
window.setTimeout(function(){
  sys.play(samplesID);
  }, 2000);



