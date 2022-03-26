'use strict';

/*   video:  {
    facingMode: {
      exact: 'environment'
    }} 
  */

const RESULT_IMAGE_SIZE = 300

const constraints = window.constraints = {
  audio: false,
  video:  {
    facingMode: {
      exact: 'environment'
    }}
};

const dataBlob = []

const setVideoPreview = (video) => {
  if (video) {
    const canvas = document.querySelector('#canvas-preview')

    const squareSize =
      video.videoWidth > video.videoHeight
        ? video.videoHeight
        : video.videoWidth

    const imageWidth = (video.videoWidth - squareSize) / 2
    const imageHeight = (video.videoHeight - squareSize) / 2

    canvas.width = RESULT_IMAGE_SIZE
    canvas.height = RESULT_IMAGE_SIZE

    const context = canvas.getContext('2d')

    if (context) {
      context.drawImage(
        video,
        imageWidth,
        imageHeight,
        squareSize,
        squareSize,
        0,
        0,
        RESULT_IMAGE_SIZE,
        RESULT_IMAGE_SIZE
      )
    }
  }
}

const startRecording = (stream) => {
  const recorder = new MediaRecorder(stream)

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

    const recordedVideo = URL.createObjectURL(recordedBlob)
    
    const video = document.querySelector('#recorder-preview');
    const playPreview = document.querySelector('#play-preview');

    playPreview.addEventListener('click', () => video.play());

    video.src = recordedVideo;
    video.load()
    video.currentTime = 0.5;
    
    video.onseeked = () => setTimeout(() => {
      setVideoPreview(video)
      console.log('onseeked')
    }, 2000)


    video.addEventListener('canplay', () => setTimeout(() => {
      setVideoPreview(video)
      console.log('canplay')
    }, 2000))

    video.addEventListener('loadedmetadata', () => setTimeout(() => {
      setVideoPreview(video)
      console.log('loadedmetadata')
    }, 2000))
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
