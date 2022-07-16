from cv2 import cv2 as cv
import utils.module as m


class VideoProcessor:
    def process(self, file):
        camera = cv.VideoCapture(file)
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