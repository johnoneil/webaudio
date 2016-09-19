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
    this._gain = system._audioCtx.createGain();
  };

  play() {
    console.log("Doing delayed play of data with samplesID ", samplesID);

    this._source = this._system._audioCtx.createBufferSource();
    var samples = this._system._samples[this._samplesID];
    this._source.buffer = samples._data;
    this._source.connect(this._gain);
    this._gain.connect(this._system._output);
    this._source.start(0);
  }
  stop() {
    console.log("stopping sound with id: ", this._id);
    this._source.stop(0);
  }
  gain(value) {
    console.log("setting gain on sound with id: ", this._id," to: ",value);
    if(value < 0.0 || value >1.0) {
      console.error("do you really want a gain value of ", value);
    }
    this._gain.gain.value = value;
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
    // set up a global gain for volume/mute
    this._output = this._audioCtx.createGain();
    this._output.connect(this._audioCtx.destination);

    // dictionary of sound samples data so multiple playing sounds can run off the same
    // decoded audio data.
    this._samples = {};

    // Objects representing actually playing sounds.
    this._sounds = {};
    
    // an outstanding promise for some async action going on
    this._promise = null;
    
    this._nextSamplesID = 1;
    this._nextSoundID = 1;

    // track globalGain for unmute purposes (unmute to previous gain value)
    this._prevGain = this._output.gain.value;
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

  gain(soundID, value) {
    if(!soundID in this._sounds) {
      console.error("can't find sound with id to set gain.");
      return;
    }
    var sound = this._sounds[soundID];
    var samplesID = sound._samplesID;
    this._do(this, samplesID, soundID, function(){sound.gain(value);});
  }
  globalGain(value) {
    console.log("setting global gain to : ", value);
    // no need for async
    if(value < 0 || value > 1) {
      console.error("trying to set global gain to value: ", value);
    }
    this._output.gain.value = value;
    //this._prevGain = this._output.gain.value;
  }
  mute() {
    console.log("muting global.");

    this._prevGain = this._output.gain.value;
    this.globalGain(0);
  }
  unmute() {
    console.log("un-muting global");
    // warn on a unmuting to a low gain value.
    if(this._prevGain < 0.01) {
      console.log("unmuting to a very low gain value.");
    }
    this.globalGain(this._prevGain);
  }

}

var sys = new SoundSystem();

var samplesID = sys.load("bear.mp3");
var soundID = sys.play(samplesID);
window.setTimeout(function(){sys.stop(soundID);}, 500);
//window.setTimeout(function(){sys.free(samplesID);}, 2000);
window.setTimeout(function(){
  soundID = sys.play(samplesID);
  }, 2000);
//window.setTimeout(function(){
//  sys.gain(soundID, 0.25);
//}, 2200);
window.setTimeout(function(){
  sys.mute();
}, 2100);
window.setTimeout(function(){
  sys.unmute();
}, 2800);







