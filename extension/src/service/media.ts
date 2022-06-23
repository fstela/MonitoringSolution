type DeviceStatus = {
    hasMicrophone: boolean;
    hasCamera: boolean;
    hasMicrophoneAccess: boolean;
    hasCameraAccess: boolean;
}

export const getUserMediaStream = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        return stream;
    }  catch(err) {
        console.log(err);
        return false;
    } 
}


