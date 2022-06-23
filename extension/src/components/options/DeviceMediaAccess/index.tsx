import { DEVICE_MEDIA_ACCESS_ACCEPTED, DEVICE_MEDIA_ACCESS_DECLINED } from "@src/pages/options/views";
import { getUserMediaStream } from "@src/service/media";
import React, { useEffect } from "react";

export const DeviceMediaAccess: React.FC = () => {
    useEffect(() => {
        getUserMediaStream().then(response => {
            if(response === false ) {
                chrome.storage.local.set({ media_device_access: DEVICE_MEDIA_ACCESS_DECLINED });
                return;
            }
            
            chrome.storage.local.set({ media_device_access: DEVICE_MEDIA_ACCESS_ACCEPTED }); 
        })
    }, [])
    return(<div>
        <p>allow pls</p>
    </div>)
}