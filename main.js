'use strict';

/*   video:  {
    facingMode: {
      exact: 'environment'
    }} 
  */

const RESULT_IMAGE_SIZE = 300

const constraints = window.constraints = {
  audio: false,
  video:   {  facingMode: {
    exact: 'environment'
  }} 
};

const dataBlob = []

const setVideoPreview = (video) => {
  if (video) {
    const errorMsg = document.querySelector('#errorMsg');

    console.log(video)

    const canvas = document.querySelector('#canvas-preview')

    errorMsg.innerHTML += `<div>video.videoHeight ${video.videoHeight}</div>`
    errorMsg.innerHTML += `<div>video.videoWidth ${video.videoWidth}</div>`

    // const squareSize =
    //   video.videoWidth > video.videoHeight
    //     ? video.videoHeight
    //     : video.videoWidth

    // errorMsg.innerHTML += `<div>squareSize ${squareSize}</div>`

    // const imageWidth = (video.videoWidth - squareSize) / 2
    // const imageHeight = (video.videoHeight - squareSize) / 2

    // errorMsg.innerHTML += `<div>imageWidth ${imageWidth}</div>`
    // errorMsg.innerHTML += `<div>imageHeight ${imageHeight}</div>`

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')

    errorMsg.innerHTML += `<div>context ${context}</div>`

    if (context) {
      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      )
    }
  }
}

const options = {mimeType:  'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'};

const startRecording = (stream) => {
  const recorder = new MediaRecorder(stream, options)
  console.log({recorder})
  var types = [
             'video/mp4; codec=vp8',
             'video/mp4; codec=daala',
             'video/mp4; codec=h264',
             'audio/mp4; codec=opus',
             'video/mp4; codec=avc1.4d002a',
             'video/mp4; codec=avc1.424028',
             'video/mp4; codec=mp4a.40.2',
             'video/mp4; codecs="avc1.424028, mp4a.40.2"'];

for (var i in types) {
  const errorMsg = document.querySelector('#errorMsg');
  const text =  "Is " + types[i] + " supported? " + (MediaRecorder.isTypeSupported(types[i]) ? "Maybe!" : "Nope :(")
  errorMsg.innerHTML += `<div>${text}</div>`
  console.log( "Is " + types[i] + " supported? " + (MediaRecorder.isTypeSupported(types[i]) ? "Maybe!" : "Nope :("));
}

  recorder.ondataavailable = (event) => dataBlob.push(event.data)
  recorder.start()

  const stopped = new Promise((resolve, reject) => {
    recorder.onstop = resolve
    recorder.onerror = (event) => reject(event.type)
  })

  setTimeout(() => {
    recorder.stop()
  }, 6000)

  return stopped.then(() => {
    const recordedBlob = new Blob(dataBlob, { type: 'video/mp4' })


    const fileObj = new File([recordedBlob], "recording.mp4", {type:  'video/mp4'});
    const fileObjUrl = URL.createObjectURL(fileObj)

    const errorMsg = document.querySelector('#errorMsg');
    const download = document.querySelector('#download');
    download.href = fileObjUrl
  
    
    const video = document.querySelector('#recorder-preview');
    const playPreview = document.querySelector('#play-preview');

    playPreview.addEventListener('click', () => video.play());

    video.src = fileObjUrl;
    video.load()
    video.currentTime = 1.5;
    
    video.addEventListener('canplay', () => setTimeout(() => {
      setVideoPreview(video)
      const errorMsg = document.querySelector('#errorMsg');
      errorMsg.innerHTML += `<div>canplay</div>`
      console.log('canplay')

    }, 2800))
  })
}

function handleSuccess(stream) {
  const video = document.querySelector('#gum-local');
  const videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log(`Using video device: ${videoTracks[0].label}`);

  video.srcObject = stream;

  startRecording(stream)
}

function handleError(error) {
  if (error.name === 'OverconstrainedError') {
    const v = constraints.video;
    errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
  } else if (error.name === 'NotAllowedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg(`getUserMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {
  const errorElement = document.querySelector('#errorMsg');
  errorElement.innerHTML += `<p>${msg}</p>`;
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

async function init(e) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
    e.target.disabled = true;
  } catch (e) {
    handleError(e);
  }
}

document.querySelector('#showVideo').addEventListener('click', e => init(e));
