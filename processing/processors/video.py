from cv2 import cv2 as cv
from utils.module import module as m


class VideoProcessor:
    def process(self, file):
        # video = cv2.VideoCapture("http://localhost:9060/monitoring/b832a39e-c644-4d13-b746-6bb33b4328b3.webm")
        camera = cv.VideoCapture("http://localhost:9060/monitoring/b832a39e-c644-4d13-b746-6bb33b4328b3.webm")
        while (camera.isOpened()):
            ret, frame = camera.read()
            if not ret:
                break
            grayFrame = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
            image, face = m.faceDetector(frame, grayFrame)
            if face is not None:
                image, PointList = m.faceLandmarkDetector(frame, grayFrame, face, True)
                RightEyePoint = PointList[36:42]
                LeftEyePoint = PointList[42:48]
                leftRatio, topMid, bottomMid = m.blinkDetector(LeftEyePoint)
                rightRatio, rTop, rBottom = m.blinkDetector(RightEyePoint)
                blinkRatio = (leftRatio + rightRatio) / 2
                mask, pos, color, rightEyeImage, croppedEyeRight = m.EyeTracking(frame, grayFrame, RightEyePoint)
                maskleft, leftPos, leftColor, leftEyeImage, croppedEyeLeft = m.EyeTracking(
                    frame, grayFrame, LeftEyePoint)
                if pos != "Center" or leftPos != "Center":
                    return False
            else:
                return False
            key = cv.waitKey(1)
            if key == ord('q'):
                break
        camera.release()
        camera.destroyAllWindows()
        return True