class Audio {
  constructor() {
    console.log("audio constructed");
    this.audioTags = [];
  }

  createAudioSnippetPlayer(chunks) {
    console.log(chunks);
    const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
    console.log(blob);

    // const audio = new Audio();
    const audioURL = window.URL.createObjectURL(blob);
    // audio.src = audioURL;
    let newAudioFile = document.createElement("audio");
    newAudioFile.src = audioURL;
    newAudioFile.controls = "controls";
    newAudioFile.id = Math.random() * (1000 - 0);
    this.audioTags.push(newAudioFile);
    document.getElementById("audioContainer").appendChild(newAudioFile);

    console.log(audioURL);
  }

  smoothData(arr) {
    const smoothArray = [];

    for (let i = 0; i < arr.length; i++) {
      if (i === 0) {
        smoothArray[i] = arr[i];
        continue;
      }
      if (i === arr.length - 1) {
        smoothArray[i] = arr[i];
        continue;
      }
      smoothArray[i] = (arr[i - 1] + arr[i + 1]) / 2;
    }
    return smoothArray;
  }

  async getInt8Array(chunks) {
    let blob = new Blob(chunks);
    const buf = await blob.arrayBuffer();
    const int8array = new Int8Array(buf);

    return int8array;
  }

  async getInt16Array(chunks) {
    let blob = new Blob(chunks);
    if (blob.size > 32000) {
      blob = blob.slice(0, 32000);
    }

    const buf = await blob.arrayBuffer();
    const arr = new Int16Array(buf, 0, Math.floor(buf.byteLength / 2));

    return arr;
  }

  runModel(classifier, arr) {
    const results = classifier.classify(arr);
    document.querySelector("#results").textContent = JSON.stringify(
      results,
      null,
      4
    );
    document.querySelector("#features").textContent = `${arr.join(", ")}`;
  }

  async getUserData(classifier) {
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          // Instantiate the media recorder.
          this.mediaRecorder = new MediaRecorder(stream, {
            audioBitsPerSecond: 128000,
          });
          console.log("start");

          // Create a buffer to store the incoming data.
          let chunks = [];

          this.mediaRecorder.ondataavailable = async (event) => {
            // chunks.push(event.data);
            // console.log(await event.data.arrayBuffer());

            // const bArray = await event.data.arrayBuffer();
            const int8array = new Int8Array(await event.data.arrayBuffer());
            console.log(int8array.join(", "));

            for (let j = 0; j < 20; j++) {
              const int16array = new Array(16000).fill(0);
              for (
                let i = 0;
                i < int8array.length && i < int16array.length;
                i++
              ) {
                let val = Math.floor((32000 / 128) * int8array[i + j * 40]);

                val = Math.min(32767, val);
                val = Math.max(-32768, val);

                if (i + j * 40 < int8array.length) {
                  int16array[i] = val;
                }
              }
              this.runModel(classifier, int16array);
            }
            if (chunks.length) {
              // just take last few sets of time
              // chunks = chunks.slice(-3);
              // this.createAudioSnippetPlayer(chunks.slice(-1));
              // convert chunks to Int16 or Int8 arrays
              // let arr = await this.getInt16Array(chunks);
              // const arr = await this.getInt8Array(chunks);
              // smoothing formula
              // arr = this.smoothData(arr);
              // run model
              // this.runModel(classifier, arr);
            }
            // chunks = chunks.slice(-3);
            // console.log(chunks);
          };

          this.mediaRecorder.onstop = async () => {
            // A "blob" combines all the audio chunks into a single entity
            // const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
            const blob = new Blob(chunks);
            // const blob = new Blob(chunks, { type: "text/html" });
            const buf = await blob.arrayBuffer();

            const arr = new Int8Array(buf);
            // arr.length = 16000;

            // console.log(arr);
            const results = classifier.classify(arr);
            document.querySelector("#results").textContent = JSON.stringify(
              results,
              null,
              4
            );

            chunks = []; // clear buffer

            // One of many ways to use the blob
            // const audio = new Audio();
            // const audioURL = window.URL.createObjectURL(blob);
            // audio.src = audioURL;

            // console.log("audio", audio);
          };

          this.mediaRecorder.start();
          setInterval(() => {
            this.mediaRecorder.requestData();
          }, 1000);
        })
        .catch((e) => console.log("you have an error:", e));
    } else {
      console.log("unable to access media device");
    }
  }
}
